'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';


export function CTA() {
  return (
    <section className="bg-black w-full overflow-hidden relative border-t border-zinc-900">
      
      <div className="max-w-6xl mx-auto min-h-[60vh] md:min-h-[80dvh] flex items-center justify-center px-6 sm:px-10 lg:px-8 relative">
        
        {/* ─── Left Side Glowing Laser Line ───────────────────────────────────── */}
        <svg 
          className="absolute left-0 h-full w-8 sm:w-16 md:w-20 lg:w-24 pointer-events-none" 
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
              <stop stopColor="#6F6F6F" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="1" stopColor="#6F6F6F" stopOpacity="0.1" />
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
            <h2 className="inline-block text-3xl md:text-5xl lg:text-6xl font-bold bg-[radial-gradient(61.17%_178.53%_at_38.83%_-13.54%,#3B3B3B_0%,#888787_12.61%,#FFFFFF_50%,#888787_80%,#3B3B3B_100%)] bg-clip-text text-transparent px-4 md:px-8 leading-tight tracking-tight">
              One script tag away <br className="hidden sm:inline" /> from knowing your traffic.
            </h2>
            <p className="max-w-lg text-xs sm:text-sm md:text-base text-zinc-400 mx-auto px-4 leading-relaxed">
              Set up in seconds, query via API, and watch your visitor count grow. Zero cookies, GDPR-compliant, and built for developers.
            </p>

            <div className="pt-8">
              <a 
                href="/auth" 
                className="px-8 py-4 relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-950 shadow-[0_4px_12px_rgba(255,255,255,0.1)] h-12 md:h-14 w-56 md:w-64 rounded-full font-semibold text-sm tracking-wide"
              >
                <span>Start Tracking Free</span>
                <ArrowRight className="h-4 w-4 text-zinc-950" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Side Glowing Laser Line ──────────────────────────────────── */}
        <svg 
          className="absolute right-0 h-full w-8 sm:w-16 md:w-20 lg:w-24 pointer-events-none" 
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
              <stop stopColor="#6F6F6F" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="1" stopColor="#6F6F6F" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

      </div>
    </section>
  );
}
export default CTA;
