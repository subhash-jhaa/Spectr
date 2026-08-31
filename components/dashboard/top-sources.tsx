"use client";

import { useState } from "react";
import { formatInteger } from "@/components/dashboard/formater";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowRightIcon } from "lucide-react";

export interface TopSourcesProps {
  data?: { source: string; visitors: number; percentage?: number }[];
}

/** Map source labels to emoji/icon + color for visual distinction. */
const SOURCE_META: Record<string, { icon: string; color: string }> = {
  // AI Tools
  ChatGPT:          { icon: "🤖", color: "text-emerald-400" },
  Claude:           { icon: "🧠", color: "text-amber-400" },
  Perplexity:       { icon: "🔮", color: "text-teal-300" },
  Copilot:          { icon: "💻", color: "text-blue-400" },
  Gemini:           { icon: "♊", color: "text-blue-300" },
  "You.com":        { icon: "⚡", color: "text-indigo-400" },
  Phind:            { icon: "🔎", color: "text-sky-300" },

  // Search Engines
  Google:           { icon: "🔍", color: "text-blue-400" },
  Bing:             { icon: "🔎", color: "text-teal-400" },
  DuckDuckGo:      { icon: "🦆", color: "text-orange-400" },
  "Brave Search":   { icon: "🦁", color: "text-orange-500" },
  Ecosia:           { icon: "🌳", color: "text-emerald-500" },
  Kagi:             { icon: "🐕", color: "text-yellow-400" },
  Qwant:            { icon: "🌐", color: "text-blue-400" },
  Yahoo:            { icon: "🟣", color: "text-purple-400" },
  Baidu:            { icon: "🔵", color: "text-blue-500" },
  Yandex:           { icon: "🟡", color: "text-yellow-400" },
  Naver:            { icon: "🟩", color: "text-green-500" },
  Sogou:            { icon: "🇨🇳", color: "text-red-400" },

  // Social & Community
  LinkedIn:         { icon: "💼", color: "text-blue-500" },
  Facebook:         { icon: "📘", color: "text-blue-600" },
  Instagram:        { icon: "📷", color: "text-pink-400" },
  "X (Twitter)":    { icon: "𝕏",  color: "text-zinc-100" },
  Threads:          { icon: "🧵", color: "text-zinc-100" },
  Bluesky:          { icon: "🦋", color: "text-sky-400" },
  Mastodon:         { icon: "🐘", color: "text-violet-400" },
  YouTube:          { icon: "▶️", color: "text-red-500" },
  Reddit:           { icon: "🟠", color: "text-orange-500" },
  TikTok:           { icon: "🎵", color: "text-pink-500" },
  Pinterest:        { icon: "📌", color: "text-red-400" },
  Discord:          { icon: "👾", color: "text-indigo-400" },
  Slack:            { icon: "💬", color: "text-emerald-400" },
  WhatsApp:         { icon: "📱", color: "text-green-400" },
  Telegram:         { icon: "✈️", color: "text-sky-400" },
  Snapchat:         { icon: "👻", color: "text-yellow-300" },

  // Tech Ecosystems
  "Hacker News":    { icon: "🟧", color: "text-orange-500" },
  GitHub:           { icon: "🐙", color: "text-zinc-300" },
  GitLab:           { icon: "🦊", color: "text-orange-400" },
  "Stack Overflow": { icon: "📚", color: "text-orange-500" },
  "Product Hunt":   { icon: "🚀", color: "text-orange-400" },
  Medium:           { icon: "📝", color: "text-zinc-300" },
  Substack:         { icon: "💌", color: "text-orange-400" },
  "Dev.to":         { icon: "👩‍💻", color: "text-zinc-200" },
  Hashnode:         { icon: "📘", color: "text-blue-400" },
  Dribbble:         { icon: "🏀", color: "text-pink-400" },
  Behance:          { icon: "🎨", color: "text-blue-400" },
  Direct:           { icon: "🔗", color: "text-zinc-400" },
};

function getSourceMeta(source: string) {
  return SOURCE_META[source] ?? { icon: "🌐", color: "text-zinc-400" };
}

export function TopSources({ data = [] }: TopSourcesProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? data : data.slice(0, 5);

  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3.5 border-b border-[#e8e6e5] dark:border-zinc-900/80">
          <CardTitle className="text-lg sm:text-xl font-bold font-roobert tracking-tight text-[#0c0a09] dark:text-white">Traffic Sources</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 mt-0.5">
            Where your visitors are coming from in the last 7&nbsp;days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
            <Table>
              <TableHeader className="bg-[#fafaf9] dark:bg-zinc-950/60">
                <TableRow className="border-b border-[#e8e6e5] dark:border-zinc-900 hover:bg-transparent text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 font-medium">
                  <TableHead className="pl-6 h-9 text-[#78716c] dark:text-zinc-400 font-semibold" scope="col">Source</TableHead>
                  <TableHead className="pr-6 text-end tabular-nums h-9 text-[#78716c] dark:text-zinc-400 font-semibold" scope="col">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.length > 0 ? (
                  displayRows.map((row) => {
                    const meta = getSourceMeta(row.source);
                    return (
                      <TableRow className="border-b border-[#e8e6e5]/60 dark:border-zinc-900/50 hover:bg-[#f5f5f4] dark:hover:bg-zinc-900/40 transition-colors" key={row.source}>
                        <TableCell className="max-w-[220px] truncate pl-6 py-3 font-medium text-xs sm:text-sm text-[#0c0a09] dark:text-zinc-200">
                          <span className="inline-flex items-center gap-2.5">
                            <span className="text-sm sm:text-base">{meta.icon}</span>
                            <span className={meta.color}>{row.source}</span>
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 py-3 text-end text-[#78716c] dark:text-zinc-400 font-mono text-xs sm:text-sm tabular-nums font-medium">
                          {formatInteger(row.visitors)}
                          {row.percentage !== undefined && (
                            <span className="ml-1.5 opacity-70">
                              ({row.percentage.toFixed(1)}%)
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-[#a8a29e] dark:text-zinc-500 font-mono text-xs">
                      No sources yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
      {data.length > 5 && (
        <div className="flex items-center justify-center py-2 px-4 border-t border-[#e8e6e5] dark:border-zinc-900/80 bg-[#fafaf9] dark:bg-zinc-950/40">
          <Button variant="ghost" className="text-xs font-mono text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : `View All (${data.length})`}
            <ArrowRightIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  );
}
