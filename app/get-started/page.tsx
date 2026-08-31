import React from "react";
import type { Metadata } from "next";
import type { Session } from "next-auth";
import { getOptionalAppSession } from "@/lib/session";
import { Navbar } from "@/components/landing/Navbar";
import { SimpleByDesign } from "@/components/landing/SimpleByDesign";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get Started in Minutes — Simple by Design | Spectr",
  description: "Spectr focuses hard on simplicity, minimalism, and ease of use. Start tracking website visitors with zero complex configuration.",
};

export default async function GetStartedPage() {
  const user = await getOptionalAppSession();
  const session = user ? ({ user, expires: "" } as unknown as Session) : null;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 font-sans selection:bg-[#3ba6f1]/20 dark:selection:bg-white/20 overflow-x-clip transition-colors duration-300">
      <Navbar session={session} />
      
      <main className="pt-24 sm:pt-28">
        <SimpleByDesign />
        <HowItWorks />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
