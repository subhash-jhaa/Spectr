"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2 } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function Hero() {
  return (
    <div className="theme-zinc w-full" style={{ "--radius": "0.5rem" } as React.CSSProperties}>
      <div className="flex min-h-full w-full items-center justify-center">
        <section className="relative isolate w-full min-h-screen translate-z-0 overflow-hidden px-4 pt-36 sm:px-6 md:px-8 md:pt-48 lg:pt-52 flex flex-col items-center bg-[#fafaf9] dark:bg-black">

          {/* ── Crisp Mountain Image Background with Subtle Fade ── */}
          <div
            className="absolute inset-0 h-full max-h-[85vh] w-full pointer-events-none z-0 overflow-hidden"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
            }}
          >
            <Image
              src="/bg-image.png"
              alt="Mountain Background"
              fill
              priority
              className="object-cover object-top opacity-30 dark:opacity-40 filter contrast-105"
            />
          </div>

          {/* Bottom fade into canvas */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#fafaf9] dark:from-black via-[#fafaf9]/80 dark:via-black/80 to-transparent pointer-events-none z-10" />

          {/* ── ContainerScroll 3D Interactive Animation ── */}
          <div className="relative z-20 w-full flex flex-col items-center">
            <ContainerScroll
              titleComponent={
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-center text-center">
                  {/* Peerlist Launchpad Badge */}
                  <div className="mb-4">
                    <a
                      href="https://peerlist.io/subhashjhadev/project/spectr--know-your-traffic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity bg-white/70 dark:bg-neutral-950/40 border border-[#e8e6e5] dark:border-white/10 backdrop-blur-md px-3.5 py-1 rounded-full shadow-sm"
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
                        <span className="text-[10px] text-[#78716c] dark:text-zinc-400 font-bold tracking-[0.2em] uppercase">Live on</span>
                        <span className="font-sans font-bold text-[#0c0a09] dark:text-white tracking-tight">Peerlist</span>
                        <span className="text-zinc-400 dark:text-zinc-600">|</span>
                        <span className="font-serif italic text-[#57534e] dark:text-zinc-300">Launchpad</span>
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

                  {/* Main Headline: Large, commanding display with signature highlight */}
                  <h1 className="font-roobert font-normal tracking-[-0.025em] text-[#0c0a09] dark:text-white leading-[1.08] text-5xl sm:text-6xl md:text-7xl lg:text-[72px]">
                    <span>Know your traffic — </span>
                    <span className="highlight-span mt-2 sm:mt-0 text-[#1d4ed8] dark:text-[#3ba6f1] bg-[#dbeafe] dark:bg-[rgba(59,166,241,0.2)] px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl">
                      simple & actionable
                    </span>
                  </h1>

                  {/* Subtitle: High contrast and crystal-clear readability */}
                  <p className="mt-5 max-w-2xl text-center text-base sm:text-lg md:text-xl text-[#27272a] dark:text-zinc-200 font-normal leading-[1.65]">
                    Drop one script tag. Watch your visitors appear live with zero cookies, zero bloat, and total privacy compliance.
                  </p>

                  {/* Seline / Spectr Design CTA Row */}
                  <div className="my-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/auth"
                      className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#3ba6f1] hover:bg-[#3398e1] border border-[#3398e1] px-7 py-3.5 text-base font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Start Free Trial</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <a
                      href="#features"
                      className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 hover:border-[#d6d3d1] dark:hover:border-zinc-700 px-7 py-3.5 text-base font-normal text-[#0c0a09] dark:text-zinc-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                      <Code2 className="h-4 w-4 text-[#78716c] dark:text-zinc-400" />
                      <span>View Live Demo</span>
                    </a>
                  </div>
                </div>
              }
            >
              <Image
                src="/mock img.png"
                alt="Spectr Dashboard Preview"
                width={2400}
                height={1350}
                priority
                className="mx-auto rounded-2xl object-cover h-full w-full object-left-top shadow-2xl"
                draggable={false}
              />
            </ContainerScroll>
          </div>

        </section>
      </div>
    </div>
  );
}

export default Hero;
