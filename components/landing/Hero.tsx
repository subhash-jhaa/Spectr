"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2 } from "lucide-react";
import { DitherBackground } from "@/components/ui/dither-background";

export function Hero() {
  return (
    <div className="theme-zinc w-full" style={{ "--radius": "0.5rem" } as React.CSSProperties}>
      <div className="flex min-h-full w-full items-center justify-center">
        <section className="relative isolate w-full min-h-screen translate-z-0 overflow-hidden px-4 pt-28 pb-12 sm:px-6 md:px-8 md:pt-32 md:pb-20 lg:pb-32 flex flex-col items-center">
          
          {/* ── Mountain Dither Background with Bottom Fade Mask ── */}
          <div
            className="absolute inset-0 h-full max-h-[85vh] w-full brightness-70 filter pointer-events-none z-0"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
            }}
          >
            <DitherBackground imageSrc="/bg-image.png" pixelSize={2} />
          </div>

          {/* ── Centered Hero Content Container ── */}
          <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center justify-center text-center py-6 sm:py-10">
            
            {/* Peerlist Launchpad Badge */}
            <div className="mb-4">
              <a
                href="https://peerlist.io/subhashjhadev/project/spectr--know-your-traffic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity bg-neutral-950/40 border border-white/10 backdrop-blur-md px-3.5 py-1 rounded-full"
              >
                {/* Laurel Left */}
                <svg width="28" height="34" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <span className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase">Live on</span>
                  <span className="font-sans font-bold text-white tracking-tight">Peerlist</span>
                  <span className="text-zinc-600">|</span>
                  <span className="font-serif italic text-zinc-300">Launchpad</span>
                </div>

                {/* Laurel Right */}
                <svg width="28" height="34" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
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

            {/* Main Headline */}
            <h1 className="font-bold tracking-tight text-white leading-[1.08] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              <span>Know your traffic.</span><br />
              <span className="text-[#DEDBC8]">In real time.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-center text-sm sm:text-base md:text-xl text-neutral-300 font-normal leading-relaxed text-shadow-black/10 text-shadow-md">
              Drop one script tag. Watch your visitors appear live — no cookies, no config.
            </p>

            {/* Aceternity Style Action Buttons */}
            <div className="my-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth"
                className="cursor-pointer rounded-full bg-blue-500 p-1 text-base text-white transition duration-200 hover:scale-[1.02] active:scale-98 shadow-[0_4px_20px_rgba(59,130,246,0.4)]"
              >
                <div className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 shadow-black/10 ring-black/10">
                  <span>Start Tracking Free</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>

              <a
                href="#how-it-works"
                className="cursor-pointer rounded-full bg-neutral-100 p-1 text-base text-black transition duration-200 hover:scale-[1.02] active:scale-98"
              >
                <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black shadow-sm ring-1 shadow-black/10 ring-black/10">
                  <Code2 className="h-4 w-4" />
                  <span>See How It Works</span>
                </div>
              </a>
            </div>

          </div>

          {/* ── Aceternity Live UI Frame / Grand Mockup Display ── */}
          <div className="relative z-20 w-full max-w-7xl px-2 sm:px-4 mt-6">
            <div className="w-full rounded-2xl sm:rounded-[32px] bg-neutral-500/10 p-1.5 sm:p-3 backdrop-blur-md shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] border border-white/10">
              <div className="w-full rounded-xl sm:rounded-[24px] bg-neutral-950/90 p-1 sm:p-2 ring-1 ring-white/10 shadow-2xl overflow-hidden">
                <Image
                  src="/mock img.png"
                  alt="Spectr Dashboard Preview"
                  width={2400}
                  height={1350}
                  priority
                  className="w-full h-auto object-cover rounded-lg sm:rounded-[20px] shadow-2xl"
                />
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}

export default Hero;
