'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-[#fafaf9] dark:bg-black w-full overflow-hidden relative border-t border-[#e8e6e5] dark:border-zinc-900">
      
      <div className="max-w-6xl mx-auto min-h-[50vh] md:min-h-[65dvh] flex items-center justify-center px-6 sm:px-10 lg:px-8 relative">
        
        {/* ─── Left Side Glowing Laser Line ───────────────────────────────────── */}
        <svg 
          className="absolute left-0 h-full w-8 sm:w-16 md:w-20 lg:w-24 pointer-events-none opacity-40 dark:opacity-100" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 89 568" 
          fill="none"
        >
          <path 
            d="M1 0.23938V207.654L88 285.695C88 285.695 87.5 493.945 88 567.813" 
            stroke="url(#animation_gradient_left)" 
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="animation_gradient_left" x1="1" y1="4.5" x2="88" y2="568" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3ba6f1" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="#3ba6f1" stopOpacity="0.8" />
              <stop offset="1" stopColor="#3ba6f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* ─── Center Content Box ─────────────────────────────────────────────── */}
        <div className="w-full max-w-4xl mx-auto text-center py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <span className="text-xs font-mono font-bold tracking-widest text-[#3ba6f1] uppercase">
              Get Started In Seconds
            </span>
            <h2 className="font-roobert text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal text-[#0c0a09] dark:text-white px-4 md:px-8 leading-[1.08] tracking-[-0.025em]">
              <span>One script tag away from </span>
              <br className="hidden sm:inline" />
              <span className="highlight-span mt-2 sm:mt-1">knowing your traffic</span>
            </h2>
            <p className="max-w-2xl text-base sm:text-lg md:text-xl font-normal text-[#78716c] dark:text-zinc-300 mx-auto px-4 leading-[1.65]">
              Set up in seconds, query via API, and watch your visitor count grow. Zero cookies, GDPR-compliant, and built for developers.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth" 
                className="px-8 py-4 cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center gap-2.5 bg-[#3ba6f1] hover:bg-[#3398e1] border border-[#3398e1] text-white shadow-lg h-14 w-60 md:w-72 rounded-full font-medium text-base tracking-normal"
              >
                <span>Start Tracking Free</span>
                <ArrowRight className="h-5 w-5 text-white" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Side Floating CTA Graphic ─────────────────────────────────── */}
        <Image
          src="/seline-cta.png"
          alt="seline-cta"
          width={775}
          height={524}
          loading="lazy"
          className="z-[2] hidden md:block absolute right-6 bottom-6 h-auto md:w-[310px] lg:w-[370px] pointer-events-none drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity"
        />

        {/* ─── Right Side Glowing Laser Line ──────────────────────────────────── */}
        <svg 
          className="absolute right-0 h-full w-8 sm:w-16 md:w-20 lg:w-24 pointer-events-none opacity-40 dark:opacity-100" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 89 568" 
          fill="none"
        >
          <path 
            d="M88 0.23938V207.654L1 285.695C1 285.695 1.5 493.945 1 567.813" 
            stroke="url(#animation_gradient_right)" 
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="animation_gradient_right" x1="88" y1="4.5" x2="1" y2="568" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3ba6f1" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="#3ba6f1" stopOpacity="0.8" />
              <stop offset="1" stopColor="#3ba6f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

      </div>
    </section>
  );
}

export default CTA;

