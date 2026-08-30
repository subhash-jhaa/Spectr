import React from 'react';
import { Session } from 'next-auth';
import { Navbar } from './landing/Navbar';
import { Hero } from './landing/Hero';
import { HowItWorks } from './landing/HowItWorks';
import { Features } from './landing/Features';
import { Integration } from './landing/Integration';
import { Testimonials } from './landing/Testimonials';
import { CTA } from './landing/CTA';
import { Footer } from './landing/Footer';
import { Pricing } from './landing/Pricing';
import { FAQ } from './landing/FAQ';
import { ScrollReveal } from './landing/ScrollReveal';

interface LandingProps {
  session?: Session | null;
}

export default function Landing({ session }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 font-sans selection:bg-[#3ba6f1]/20 dark:selection:bg-white/20 overflow-x-clip transition-colors duration-300">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Navbar session={session} />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <Features />
      </ScrollReveal>

      {/* ── Integration / Code section ─────────────────────────────────────── */}
      <ScrollReveal>
        <Integration />
      </ScrollReveal>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <Pricing />
      </ScrollReveal>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <FAQ />
      </ScrollReveal>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <CTA />
      </ScrollReveal>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <Footer />
      </ScrollReveal>

    </div>
  );
}