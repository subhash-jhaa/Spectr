"use client"
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SectionLabel, fadeUp, staggerContainer } from './Primitives';
import { HeroScript } from './HeroVisuals';

export function Integration() {
  return (
    <section id="code" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      {/* Outer Box with Border */}
      <div className="bg-zinc-950/30 rounded-2xl p-2 relative overflow-hidden border border-zinc-800/80">
        {/* Inner Box with Subtle Border */}
        <div className="rounded-[14px] bg-zinc-950 border border-zinc-800/30 relative overflow-hidden w-full p-8 sm:p-12">

          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10"
          >
            <motion.div variants={fadeUp} custom={0}>
              <SectionLabel>Zero config</SectionLabel>
              <h2 className="font-mono text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-4 text-balance">
                Add Analytics<br />in 5 Seconds
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                No npm install. No build step. No configuration file. Paste one script tag anywhere in your HTML and you&apos;re live.
              </p>
              <div className="space-y-3">
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
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="h-5 w-5 rounded-full bg-black border border-zinc-700 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-[13px] text-zinc-400 group-hover:text-zinc-300 transition-colors">{t}</span>
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
