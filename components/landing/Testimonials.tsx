"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { cn, fadeUp } from './Primitives';

// ─── Extended Testimonials Data with Real Avatars ────────────────────────────
const TESTIMONIALS = [
  {
    name: "Yash Yadav",
    handle: "@yashyadav",
    role: "Full Stack Engineer",
    platform: "Peerlist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    content: "Congrats on the launch, Subhash! Dropped it on my portfolio and the setup was literally 5 seconds. The real-time dashboard updates instantly."
  },
  {
    name: "Karan Verma",
    handle: "@karanv",
    role: "Frontend Developer",
    platform: "Twitter / X",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    content: "The dev console mode is super handy. Being able to see active user logs right there is extremely useful during development."
  },
  {
    name: "Anjali Sharma",
    handle: "@anjalish",
    role: "Indie Builder",
    platform: "Peerlist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    content: "Finally, an analytics tool that doesn't require GDPR consent banners or slow down my page load speed. Exactly what I was looking for."
  },
  {
    name: "Rohan Mehta",
    handle: "@rohanm",
    role: "Software Engineer",
    platform: "Peerlist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    content: "Simple, clean, and under 2KB. This is exactly what I wanted for my personal projects instead of configuring heavy analytics software."
  },
  {
    name: "Devanshu Patel",
    handle: "@devpatel",
    role: "Next.js Developer",
    platform: "Twitter / X",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    content: "The real-time visitor globe looks incredible on large screens. Cleanest minimal UI I've seen in any telemetry tool."
  },
  {
    name: "Priya Nair",
    handle: "@priyanair",
    role: "Product Designer",
    platform: "Peerlist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    content: "Zero learning curve. Everything is right where you need it without clutter. The dark mode aesthetics are top notch."
  }
];

const COLUMN_1 = [TESTIMONIALS[0], TESTIMONIALS[2], TESTIMONIALS[4]];
const COLUMN_2 = [TESTIMONIALS[1], TESTIMONIALS[3], TESTIMONIALS[5]];

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100 relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-500/[0.03] blur-[6rem] rounded-full pointer-events-none" />

      {/* ─── Layout Grid ───────────────── */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-10 pt-10 border-t border-[#e8e6e5] dark:border-zinc-900 items-start">
        
        {/* Left-hand text column */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="w-full lg:w-[38%] flex flex-col justify-start lg:sticky lg:top-28"
        >
          {/* Peerlist Launchpad Laurel Badge */}
          <div className="mb-4">
            <a
              href="https://peerlist.io/subhashjhadev/project/spectr--know-your-traffic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity bg-white/80 dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800 backdrop-blur-md px-3.5 py-1 rounded-full shadow-xs w-fit"
            >
              {/* Laurel Left */}
              <svg width="22" height="26" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g fill="#00AA45">
                  <path d="M30 42C22 40 14 32 12 20C10.5 12 12 6 14 2" stroke="#00AA45" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M12 38c-3-1-6-4-5.5-7.5 3 0.5 5.5 3.5 5.5 7.5z" />
                  <path d="M10 32c-3.5-2-7-5.5-5.5-9 3.5 0.5 6 5 5.5 9z" />
                  <path d="M8 25c-4-2.5-7-6.5-5-9.5 3.5 1 5.5 5.5 5 9.5z" />
                  <path d="M7 18c-3.5-3-6-7.5-3.5-10 3 1.5 5 6 3.5 10z" />
                  <path d="M8 11c-3-3-4.5-7.5-2-9.5 2.5 1.5 3.5 6 2 9.5z" />
                  <path d="M28 38c1.5-2.5 1-6 4-7.5 2 2 0.5 5.5-4 7.5z" />
                  <path d="M24 31c2-3 2-6.5 5-7.5 1.5 2.5 0 5.5-5 7.5z" />
                  <path d="M20 24c2.5-3 2.5-6.5 5.5-7 1 2.5-0.5 5.5-5.5 7z" />
                  <path d="M17 17c2.5-3 3-7 6-7 0.5 2.5-1 5.5-6 7z" />
                  <path d="M14 10c2-3 3-6.5 5.5-6 0 2-1.5 4.5-5.5 6z" />
                </g>
              </svg>

              {/* Text Content */}
              <div className="flex items-center gap-1.5 leading-none text-xs">
                <span className="text-[9.5px] text-[#78716c] dark:text-zinc-400 font-bold tracking-[0.18em] uppercase">Live on</span>
                <span className="font-sans font-bold text-[#0c0a09] dark:text-white tracking-tight">Peerlist</span>
                <span className="text-zinc-400 dark:text-zinc-600">|</span>
                <span className="font-serif italic text-[#57534e] dark:text-zinc-300">Launchpad</span>
              </div>

              {/* Laurel Right */}
              <svg width="22" height="26" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
                <g fill="#00AA45">
                  <path d="M30 42C22 40 14 32 12 20C10.5 12 12 6 14 2" stroke="#00AA45" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M12 38c-3-1-6-4-5.5-7.5 3 0.5 5.5 3.5 5.5 7.5z" />
                  <path d="M10 32c-3.5-2-7-5.5-5.5-9 3.5 0.5 6 5 5.5 9z" />
                  <path d="M8 25c-4-2.5-7-6.5-5-9.5 3.5 1 5.5 5.5 5 9.5z" />
                  <path d="M7 18c-3.5-3-6-7.5-3.5-10 3 1.5 5 6 3.5 10z" />
                  <path d="M8 11c-3-3-4.5-7.5-2-9.5 2.5 1.5 3.5 6 2 9.5z" />
                  <path d="M28 38c1.5-2.5 1-6 4-7.5 2 2 0.5 5.5-4 7.5z" />
                  <path d="M24 31c2-3 2-6.5 5-7.5 1.5 2.5 0 5.5-5 7.5z" />
                  <path d="M20 24c2.5-3 2.5-6.5 5.5-7 1 2.5-0.5 5.5-5.5 7z" />
                  <path d="M17 17c2.5-3 3-7 6-7 0.5 2.5-1 5.5-6 7z" />
                  <path d="M14 10c2-3 3-6.5 5.5-6 0 2-1.5 4.5-5.5 6z" />
                </g>
              </svg>
            </a>
          </div>

          <h2 className="font-roobert text-4xl sm:text-5xl md:text-[50px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.025em] leading-[1.12]">
            <span>What builders say — </span>
            <span className="highlight-span mt-2">simple & fast</span>
          </h2>

          <p className="text-base sm:text-lg font-normal text-[#78716c] dark:text-zinc-300 mt-5 leading-[1.65] max-w-md">
            Simplify site analytics, event tracking, and user telemetry with cutting-edge tools built to be lightweight, developer-friendly, and privacy-respecting.
          </p>

          {/* Social Proof Stats */}
          <div className="mt-8 pt-6 border-t border-[#e8e6e5] dark:border-zinc-900/80 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {TESTIMONIALS.slice(0, 4).map((t, i) => (
                <div 
                  key={i} 
                  className="relative w-9 h-9 rounded-full border-2 border-white dark:border-black overflow-hidden bg-[#f5f5f4] dark:bg-zinc-900 shadow-sm"
                >
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    sizes="36px"
                    className="object-cover object-center"
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs font-mono text-[#78716c] dark:text-zinc-400 mt-0.5">
                Loved by modern builders & teams
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right animated marquee columns */}
        <div className="w-full lg:w-[62%] h-[560px] overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            
            {/* Column 1 - Marquee Up */}
            <div className="relative overflow-hidden group">
              <motion.div
                animate={{ y: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 22,
                  ease: "linear",
                }}
                className="flex flex-col gap-4 group-hover:[animation-play-state:paused]"
              >
                {[...COLUMN_1, ...COLUMN_1].map((item, idx) => (
                  <TestimonialCard key={`col1-${idx}`} item={item} />
                ))}
              </motion.div>
            </div>

            {/* Column 2 - Marquee Down (Offset) */}
            <div className="relative overflow-hidden hidden sm:block group">
              <motion.div
                animate={{ y: ["-50%", "0%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 26,
                  ease: "linear",
                }}
                className="flex flex-col gap-4 group-hover:[animation-play-state:paused]"
              >
                {[...COLUMN_2, ...COLUMN_2].map((item, idx) => (
                  <TestimonialCard key={`col2-${idx}`} item={item} />
                ))}
              </motion.div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}

function TestimonialCard({ item }: { item: typeof TESTIMONIALS[number] }) {
  return (
    <div className="bg-white/80 dark:bg-zinc-950/30 hover:bg-[#fafaf9] dark:hover:bg-zinc-950/50 transition-all duration-300 rounded-3xl p-2 border border-[#e8e6e5] dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none group/card">
      <div className="rounded-[18px] bg-white dark:bg-zinc-950 border border-[#e8e6e5]/60 dark:border-zinc-800/30 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-colors">
        
        {/* Subtle Hover Glow */}
        <div className="-bottom-20 left-[50%] -translate-x-[50%] opacity-0 group-hover/card:opacity-100 z-0 absolute bg-gradient-to-t from-blue-500/10 to-transparent blur-[3rem] rounded-full transition-opacity duration-500 w-32 h-32 pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full border border-[#e8e6e5] dark:border-zinc-800 overflow-hidden shrink-0 shadow-inner bg-[#f5f5f4] dark:bg-zinc-900">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  fill
                  sizes="40px"
                  className="object-cover object-center"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-[#0c0a09] dark:text-white leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-[#78716c] dark:text-zinc-400 mt-0.5">
                  {item.role}
                </p>
              </div>
            </div>

            <span className={cn(
              "text-[10px] font-mono font-medium rounded-full px-2 py-0.5 border shadow-2xs",
              item.platform === "Peerlist" 
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : item.platform === "Product Hunt"
                ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
            )}>
              {item.platform}
            </span>
          </div>

          {/* Quote Body */}
          <div className="relative">
            <Quote className="absolute -top-1.5 -left-1.5 h-5 w-5 text-[#d6d3d1] dark:text-zinc-800 opacity-40 rotate-180 pointer-events-none" />
            <p className="text-sm sm:text-[14.5px] text-[#292524] dark:text-zinc-200 leading-[1.65] font-normal italic relative z-10 pl-2">
              &ldquo;{item.content}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
