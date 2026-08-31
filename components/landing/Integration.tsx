"use client"
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SectionLabel, fadeUp, staggerContainer } from './Primitives';
import { HeroScript } from './HeroVisuals';

export function Integration() {
  return (
    <section id="code" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Outer Box with Border */}
      <div className="bg-white/80 dark:bg-zinc-950/30 rounded-2xl p-2 relative overflow-hidden border border-[#e8e6e5] dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
        {/* Inner Box with Subtle Border */}
        <div className="rounded-[14px] bg-white dark:bg-zinc-950 border border-[#e8e6e5]/60 dark:border-zinc-800/30 relative overflow-hidden w-full p-8 sm:p-12">

          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3ba6f1]/5 dark:bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10"
          >
            <motion.div variants={fadeUp} custom={0}>
              <SectionLabel>Zero config</SectionLabel>
              <h2 className="font-roobert text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.025em] leading-[1.15] mb-5 text-balance">
                <span>Add analytics in </span>
                <span className="highlight-span">5 seconds</span>
              </h2>
              <p className="text-base sm:text-lg font-normal text-[#78716c] dark:text-zinc-300 leading-[1.64] mb-8">
                No npm install. No build step. No configuration file. Paste one script tag anywhere in your HTML and you&apos;re live.
              </p>
              <div className="space-y-4">
                {[
                  'Works with React, Vue, Next.js, and plain HTML',
                  'GDPR & CCPA compliant by default',
                  'Under 2KB — zero impact on Core Web Vitals',
                  'Data appears within seconds of install',
                ].map((t, i) => (
                  <motion.div 
                    key={i} 
                    variants={fadeUp}
                    custom={i + 1}
                    className="flex items-center gap-3.5 group"
                  >
                    <div className="h-6 w-6 rounded-full bg-[#f5f5f4] dark:bg-black border border-[#e8e6e5] dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:border-[#3ba6f1] transition-colors">
                      <Check className="h-3.5 w-3.5 text-[#3ba6f1] dark:text-emerald-400" />
                    </div>
                    <span className="text-sm sm:text-base text-[#0c0a09] dark:text-zinc-300 font-medium group-hover:text-[#3ba6f1] dark:group-hover:text-white transition-colors">{t}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={fadeUp} custom={2}>
              <HeroScript />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
