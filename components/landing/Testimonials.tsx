'use client';

import React from 'react';
import NextImage from 'next/image';
import { Quote } from 'lucide-react';
import { cn, CARD, CARD_HOVER } from './Primitives';

// ─── Constants & Data ────────────────────────────────────────────────────────
const MAIN_TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Founder, SaaSify",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
    content: "This platform has completely transformed how I manage my visitor insights. The real-time console is extremely intuitive and powerful."
  },
  {
    name: "Michael Chen",
    role: "Lead Engineer, DevCore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
    content: "The privacy-first tracking has given us all the insights we need without having to show annoying cookie consent banners to our developers."
  },
  {
    name: "Emma Davis",
    role: "Solopreneur",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
    content: "As someone launching multiple indie products, this platform made it incredibly easy to get started and get clean visitor analytics in seconds."
  },
  {
    name: "Alex Patel",
    role: "Tech Lead, FlowState",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
    content: "Dropped the 1-line script in my React app and had live page tracking instantly. The developer-first experience is simply unmatched."
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
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                    <NextImage src={t.avatar} alt={t.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{t.name}</h3>
                    <p className="text-xs text-zinc-400">{t.role}</p>
                  </div>
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
