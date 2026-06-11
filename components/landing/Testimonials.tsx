'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { cn, CARD, CARD_HOVER } from './Primitives';

// ─── Constants & Data ────────────────────────────────────────────────────────
// ─── Constants & Data ────────────────────────────────────────────────────────
const MAIN_TESTIMONIALS = [
  {
    name: "Yash Yadav",
    role: "Full Stack Engineer",
    content: "Congrats on the launch, Subhash! Dropped it on my portfolio and the setup was literally 5 seconds. The real-time dashboard updates instantly."
  },
  {
    name: "Karan Verma",
    role: "Frontend Developer",
    content: "The dev console mode is super handy. Being able to see active user logs right there is extremely useful during development."
  },
  {
    name: "Anjali Sharma",
    role: "Indie Builder",
    content: "Finally, an analytics tool that doesn't require GDPR consent banners or slow down my page load speed. Exactly what I was looking for."
  },
  {
    name: "Rohan Mehta",
    role: "Software Engineer",
    content: "Simple, clean, and under 2KB. This is exactly what I wanted for my personal projects instead of configuring heavy analytics software."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden bg-black text-zinc-100">
      
      {/* ─── Staggered Grid ───────────────── */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 pt-10 border-t border-zinc-900">
        
        {/* Left-hand text column */}
        <div className="w-full lg:w-[40%] flex flex-col justify-start">
          <div className="sticky top-24">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-[radial-gradient(61.17%_178.53%_at_38.83%_-13.54%,#3B3B3B_0%,#888787_12.61%,#FFFFFF_50%,#888787_80%,#3B3B3B_100%)] bg-clip-text text-transparent tracking-tight leading-tight">
              What they <br /> say about us
            </h2>
            <p className="text-sm text-zinc-400 mt-6 max-w-sm leading-relaxed">
              Simplify site analytics, event tracking, and user flows with cutting-edge tools built to be lightweight, developer-friendly, and privacy-respecting.
            </p>
          </div>
        </div>

        {/* Right staggered cards column */}
        <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {MAIN_TESTIMONIALS.map((t, idx) => {
            const staggeredClass = idx % 2 === 1 ? "lg:mt-[40px]" : "lg:mt-0";

            return (
              <div 
                key={t.name}
                className={cn(
                  CARD, CARD_HOVER,
                  "flex flex-col min-h-[220px] p-8 relative isolate overflow-hidden",
                  staggeredClass
                )}
              >
                {/* Background Gradient Effect */}
                <div className="absolute inset-px rounded-[11px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none -z-10" />
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-11 h-11 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center text-[#DEDBC8] font-mono text-sm font-bold shrink-0 shadow-inner">
                    {t.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                  <span className="text-[9px] text-[#00AA45] bg-[#00AA45]/5 border border-[#00AA45]/20 rounded px-1.5 py-0.5 ml-auto font-mono uppercase tracking-wider font-semibold">
                    Peerlist
                  </span>
                </div>

                <div className="relative flex-1">
                  <Quote className="absolute -top-2 -left-2 h-6 w-6 text-zinc-800 opacity-30 rotate-180" />
                  <p className="relative z-10 text-sm text-zinc-300 leading-relaxed font-normal italic">
                    &quot;{t.content}&quot;
                  </p>
                </div>
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
export default Testimonials;
