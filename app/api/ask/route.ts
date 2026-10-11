import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { ProjectQueries } from "@/queries";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, readJsonBody } from '@/lib/request-limits';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user session using the same method the dashboard uses (401 if unauthenticated)
    const user = await getAuthenticatedUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Read site_id and question from the request body
    const limit = await checkRateLimit('ask', user.id, 10);
    if (limit.status !== 200) return NextResponse.json({ error: limit.status === 429 ? 'Too many requests' : 'AI temporarily unavailable' }, { status: limit.status, headers: { 'Retry-After': String(limit.retryAfter) } });
    let body;
    try { body = await readJsonBody(req); }
    catch (error) { return NextResponse.json({ error: 'Invalid request body' }, { status: error instanceof Error && error.message === 'Request body too large' ? 413 : 400 }); }
    let siteId = typeof body.site_id === 'string' ? body.site_id : typeof body.projectId === 'string' ? body.projectId : '';
    const question = body?.question;

    if (!question || typeof question !== "string" || !question.trim() || question.length > 2000) {
      return NextResponse.json(
        { error: "question parameter is required and cannot be empty." },
        { status: 400 }
      );
    }

    // If site_id is not specified in the body, fall back to user's first project
    if (!siteId || typeof siteId !== "string" || !siteId.trim()) {
      const userProjects = await ProjectQueries.findByUserId(user.id);
      if (userProjects.success && userProjects.data && userProjects.data.length > 0) {
        siteId = userProjects.data[0].id;
      } else {
        return NextResponse.json(
          { error: "site_id parameter is required, and no projects were found for your account." },
          { status: 400 }
        );
      }
    }

    const trimmedSiteId = siteId.trim();
    const trimmedQuestion = question.trim();

    // 3. Verify authenticated user actually owns this site_id via existing Prisma pattern (403 if not)
    const ownershipResult = await ProjectQueries.findByIdAndUser(trimmedSiteId, user.id);
    if (!ownershipResult.success || !ownershipResult.data) {
      return NextResponse.json(
        { error: "Forbidden: You do not own or have access to this site." },
        { status: 403 }
      );
    }

    // 4. Forward the request to the spectr-ai service
    let serviceUrl = process.env.SPECTR_AI_URL || "http://127.0.0.1:8000/ask";
    if (!serviceUrl.endsWith("/ask")) {
      serviceUrl = `${serviceUrl.replace(/\/+$/, "")}/ask`;
    }

    const internalSecret = process.env.INTERNAL_SHARED_SECRET;
    if (!internalSecret) return NextResponse.json({ error: 'AI service is not configured' }, { status: 503 });

    const controller = new AbortController();
    // 30-second timeout to accommodate LLM generation latency
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(serviceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Site-ID": trimmedSiteId,
          "X-Internal-Secret": internalSecret,
        },
        body: JSON.stringify({ question: trimmedQuestion }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      // 5. Fire-and-forget audit log — never blocks or breaks the response
      if (data !== null && response.ok) {
        await (async () => {
          try {
            await prisma.askQueryLog.create({
              data: {
                siteId: trimmedSiteId,
                question: trimmedQuestion,
                pathTaken: data.path_taken ?? "neither",
                templateUsed: data.template_used ?? null,
                answer: data.answer ?? "",
              },
            });
          } catch (logErr) {
            console.error("[AskQueryLog] Failed to write audit log:", logErr);
          }
        })();
      }

      // 6. Return the spectr-ai response body as-is to the frontend
      if (data !== null) {
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(
        { error: `Spectr AI service returned status ${response.status} with empty response.` },
        { status: response.status }
      );
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      const isAbort = (err as { name?: string })?.name === "AbortError";
      if (isAbort) {
        return NextResponse.json(
          { error: "Ask Spectr AI service timed out (30s limit). Please try again." },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          error: "Unable to connect to Ask Spectr service. Please verify spectr-ai backend is running.",
        },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    console.error("Ask API route error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
