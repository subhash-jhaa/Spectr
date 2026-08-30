import React from 'react';
import { Quote } from 'lucide-react';
import { cn } from './Primitives';

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
    <section id="testimonials" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100">
      
      {/* ─── Staggered Grid ───────────────── */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 pt-10 border-t border-[#e8e6e5] dark:border-zinc-900">
        
        {/* Left-hand text column */}
        <div className="w-full lg:w-[40%] flex flex-col justify-start">
          <div className="sticky top-24">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#3ba6f1] uppercase">
              Community Love
            </span>
            <h2 className="font-roobert text-4xl md:text-5xl lg:text-[48px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.025em] leading-[1.15] mt-2">
              <span>What builders say — </span>
              <span className="highlight-span mt-2">simple & fast</span>
            </h2>
            <p className="text-base sm:text-lg font-normal text-[#78716c] dark:text-zinc-300 mt-6 max-w-sm leading-[1.65]">
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
                  "rounded-2xl border border-[#e8e6e5] dark:border-zinc-800/80 bg-white dark:bg-zinc-950/50 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none hover:-translate-y-1 transition-all duration-300",
                  "flex flex-col min-h-[220px] p-8 relative isolate overflow-hidden",
                  staggeredClass
                )}
              >
                {/* Background Gradient Effect */}
                <div className="absolute inset-px rounded-[15px] bg-gradient-to-b from-black/[0.01] dark:from-white/[0.02] to-transparent pointer-events-none -z-10" />
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-[#f5f5f4] dark:bg-zinc-950 flex items-center justify-center text-[#3ba6f1] dark:text-[#DEDBC8] font-mono text-sm font-bold shrink-0 shadow-inner">
                    {t.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#0c0a09] dark:text-white">{t.name}</h3>
                    <p className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400">{t.role}</p>
                  </div>
                  <span className="text-[10px] text-[#00AA45] bg-[#00AA45]/10 border border-[#00AA45]/20 rounded px-2 py-0.5 ml-auto font-mono uppercase tracking-wider font-semibold">
                    Peerlist
                  </span>
                </div>

                <div className="relative flex-1">
                  <Quote className="absolute -top-2 -left-2 h-7 w-7 text-[#d6d3d1] dark:text-zinc-800 opacity-40 rotate-180" />
                  <p className="relative z-10 text-base text-[#0c0a09] dark:text-zinc-200 leading-[1.65] font-normal italic">
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
