import React from 'react';
import { Session } from 'next-auth';
import { Navbar } from './landing/Navbar';
import { Hero } from './landing/Hero';
import { HeroVisuals } from './landing/HeroVisuals';
import { Stats } from './landing/Stats';
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
    <div className="min-h-screen bg-black text-zinc-100 overflow-x-clip">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Navbar session={session} />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <Hero />
      </ScrollReveal>

      {/* ── Hero Visuals ───────────────────────────────────────────────────── */}
      <ScrollReveal>
        <HeroVisuals />
      </ScrollReveal>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <Stats />
      </ScrollReveal>

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