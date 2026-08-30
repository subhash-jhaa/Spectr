"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { cn, SectionLabel, fadeUp } from './Primitives';
import { FEATURES } from './Constants';

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center mb-16">
        <SectionLabel>Built for developers</SectionLabel>
        <h2 className="font-roobert text-4xl sm:text-5xl md:text-[52px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.025em] leading-[1.12]">
          <span>Everything you need — </span>
          <span className="highlight-span">zero bloat</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg md:text-[18px] font-normal text-[#78716c] dark:text-zinc-400 max-w-xl mx-auto leading-[1.64]">
          No bloated dashboards. No enterprise pricing. Fast, clean analytics that stay out of your way.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}

type FeatureVariant = 'realtime' | 'privacy' | 'console' | 'script' | 'insights' | 'api';

interface Feature {
  readonly icon: React.ElementType;
  readonly title: string;
  readonly desc: string;
  readonly variant: FeatureVariant;
  readonly span: number;
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { span } = feature;
  const Icon = feature.icon;

  // Map glow colors based on variant
  const glowColors: Record<FeatureVariant, string> = {
    realtime: 'from-blue-500/10 to-transparent',
    privacy: 'from-rose-500/10 to-transparent',
    console: 'from-violet-500/10 to-transparent',
    script: 'from-emerald-500/10 to-transparent',
    insights: 'from-amber-500/10 to-transparent',
    api: 'from-fuchsia-500/10 to-transparent',
  };

  const glowColor = glowColors[feature.variant];
  const showGiantIcon = feature.variant !== 'realtime' && feature.variant !== 'script';

  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={{ once: true }}
      variants={fadeUp} custom={index * 0.2}
      className={cn(
        span === 4 ? "lg:col-span-4" : span === 3 ? "lg:col-span-3" : "lg:col-span-2",
        "h-full"
      )}
    >
      {/* Outer Box with Border & Hover Bg Transition */}
      <div className="bg-white/80 dark:bg-zinc-950/30 hover:bg-[#fafaf9] dark:hover:bg-zinc-950/45 transition-all duration-500 rounded-2xl p-2 h-full relative overflow-hidden border border-[#e8e6e5] dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-none group">
        {/* Inner Box with Subtle Border & backdrop blur */}
        <div className="rounded-[14px] bg-white dark:bg-zinc-950 border border-[#e8e6e5]/60 dark:border-zinc-800/30 h-full transition-all duration-500 relative overflow-hidden w-full p-5 sm:p-6 flex flex-col justify-between">
          
          {/* Backdrop Glow Effect on Hover */}
          <div className={cn(
            "-bottom-40 md:-bottom-64 left-[50%] -translate-x-[50%] opacity-0 group-hover:opacity-100 z-0 absolute bg-gradient-to-t blur-[4rem] md:blur-[6rem] rounded-full transition-all duration-700 ease-out w-40 md:w-96 h-40 md:h-96 pointer-events-none",
            glowColor
          )} />

          <FeatureContent feature={feature} />

          {/* Large bottom-right Icon from the design */}
          {showGiantIcon && (
            <div className="absolute bottom-4 right-4 opacity-[0.04] dark:opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 z-0 pointer-events-none">
              <Icon className="w-24 h-24 text-[#0c0a09] dark:text-zinc-100" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FeatureContent({ feature }: { feature: Feature }) {
  switch (feature.variant) {
    case 'realtime': return <RealtimeFeature feature={feature} />;
    case 'privacy': return <PrivacyFeature feature={feature} />;
    case 'console': return <ConsoleFeature feature={feature} />;
    case 'script': return <ScriptFeature feature={feature} />;
    case 'insights': return <InsightsFeature feature={feature} />;
    case 'api': return <ApiFeature feature={feature} />;
    default: return null;
  }
}

function RealtimeFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[#f5f5f4] dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800/80 group-hover:border-[#3ba6f1]/50 group-hover:bg-blue-50/50 dark:group-hover:bg-zinc-900/80 transition-all duration-300">
          <Icon className="h-4 w-4 text-[#78716c] dark:text-zinc-400 group-hover:text-[#3ba6f1] transition-colors duration-300" />
        </div>
        <h3 className="font-semibold text-[#0c0a09] dark:text-zinc-100 text-base">{title}</h3>
      </div>
      <p className="text-[#78716c] dark:text-zinc-400 text-[13px] max-w-xs leading-relaxed mb-6">{desc}</p>
      <div className="mt-auto relative">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-[#0c0a09] dark:text-zinc-100 tracking-tighter">100%</span>
          <span className="text-[#a8a29e] dark:text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Real-time</span>
        </div>
      </div>
      <div className="absolute right-[-5%] bottom-[-15%] pointer-events-none opacity-20 dark:opacity-20 group-hover:opacity-45 transition-all duration-500 group-hover:scale-105 origin-bottom-right">
        <svg width="300" height="300" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="150" stroke="currentColor" className="text-[#3ba6f1]/40" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" className="text-[#3ba6f1]/30" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="50" stroke="currentColor" className="text-[#3ba6f1]/50" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

function PrivacyFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <div className="mb-4 relative">
        <div className="relative z-10 p-4 rounded-full bg-[#f5f5f4] dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800/80 shadow-md group-hover:border-[#3ba6f1]/50 group-hover:bg-blue-50/50 dark:group-hover:bg-zinc-900/80 group-hover:scale-110 transition-all duration-300">
          <Icon className="h-6 w-6 text-[#78716c] dark:text-zinc-400 group-hover:text-[#3ba6f1] transition-colors duration-300" />
        </div>
        <div className="absolute inset-0 animate-ping opacity-10 group-hover:opacity-20 bg-[#3ba6f1] rounded-full blur-xl transition-all duration-300" />
      </div>
      <h3 className="font-semibold text-[#0c0a09] dark:text-zinc-100 text-[14px] mb-1">{title}</h3>
      <p className="text-[#78716c] dark:text-zinc-500 text-[12px] leading-relaxed">{desc}</p>
    </div>
  );
}

function ConsoleFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 rounded-lg bg-[#f5f5f4] dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800/80 w-fit mb-3 group-hover:border-[#3ba6f1]/50 group-hover:bg-blue-50/50 dark:group-hover:bg-zinc-900/80 transition-all duration-300">
        <Icon className="h-4 w-4 text-[#78716c] dark:text-zinc-400 group-hover:text-[#3ba6f1] transition-colors duration-300" />
      </div>
      <h3 className="font-semibold text-[#0c0a09] dark:text-zinc-100 text-[14px] mb-1">{title}</h3>
      <p className="text-[#78716c] dark:text-zinc-500 text-[12px] leading-relaxed mb-4">{desc}</p>
      <div className="mt-auto bg-[#fafaf9] dark:bg-zinc-950/40 border border-[#e8e6e5] dark:border-zinc-800/60 rounded-lg p-2 font-mono text-[9px] text-[#78716c] dark:text-zinc-500 group-hover:border-[#3ba6f1]/40 transition-all duration-300 code-section">
        <div className="flex gap-2 mb-1">
          <div className="w-1 h-1 rounded-full bg-red-500/40 group-hover:bg-red-500/70 transition-colors duration-300" />
          <div className="w-1 h-1 rounded-full bg-amber-500/40 group-hover:bg-amber-500/70 transition-colors duration-300" />
          <div className="w-1 h-1 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500/70 transition-colors duration-300" />
        </div>
        <div className="text-[#0c0a09] dark:text-zinc-400 transition-colors duration-300">$ node spectr.js</div>
        <div className="text-emerald-600 dark:text-emerald-500/70 transition-colors duration-300">✔ Listening on port 3000</div>
      </div>
    </div>
  );
}

function ScriptFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 h-full -m-5 sm:-m-6")}>
      <div className="p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="p-2 rounded-lg bg-[#f5f5f4] dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800/80 w-fit mb-4 group-hover:border-[#3ba6f1]/50 group-hover:bg-blue-50/50 dark:group-hover:bg-zinc-900/80 transition-all duration-300">
            <Icon className="h-4 w-4 text-[#78716c] dark:text-zinc-400 group-hover:text-[#3ba6f1] transition-colors duration-300" />
          </div>
          <h3 className="font-semibold text-[#0c0a09] dark:text-zinc-100 text-base mb-1">{title}</h3>
          <p className="text-[#78716c] dark:text-zinc-500 text-[13px] leading-relaxed">{desc}</p>
        </div>
        <div className="mt-6 rounded-lg border border-[#e8e6e5] dark:border-zinc-800/80 bg-[#fafaf9] dark:bg-zinc-950/40 p-2.5 font-mono text-[9px] sm:text-[10px] text-[#0c0a09] dark:text-zinc-400 group-hover:border-[#3ba6f1]/40 transition-all duration-300 overflow-hidden code-section">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="text-[#78716c] dark:text-zinc-600">&lt;script</span>
            <span className="text-amber-600 dark:text-amber-500/80">src</span>
            <span className="text-emerald-600 dark:text-emerald-500/80 break-all">{`"https://spectr.subhashjha.me/track.js"`}</span>
            <span className="text-[#78716c] dark:text-zinc-600">&gt;&lt;/script&gt;</span>
          </div>
        </div>
      </div>
      <div className="relative bg-[#fafaf9] dark:bg-zinc-950/10 border-t border-[#e8e6e5] dark:border-zinc-800/80 sm:border-t-0 sm:border-l overflow-hidden min-h-[140px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-24 text-[#e8e6e5] dark:text-zinc-800/40 group-hover:text-[#3ba6f1]/20 transition-all duration-300" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,10 50,50 T100,50 T150,50 T200,50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" className="animate-[pulse_3s_infinite]" />
            <path d="M0,60 Q25,20 50,60 T100,60 T150,60 T200,60" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function InsightsFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 rounded-lg bg-[#f5f5f4] dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800/80 w-fit mb-3 group-hover:border-[#3ba6f1]/50 group-hover:bg-blue-50/50 dark:group-hover:bg-zinc-900/80 transition-all duration-300">
        <Icon className="h-4 w-4 text-[#78716c] dark:text-zinc-400 group-hover:text-[#3ba6f1] transition-colors duration-300" />
      </div>
      <h3 className="font-semibold text-[#0c0a09] dark:text-zinc-100 text-base mb-1">{title}</h3>
      <p className="text-[#78716c] dark:text-zinc-500 text-[13px] leading-relaxed mb-4">{desc}</p>
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {[42, 28, 15, 64].map((v, i) => (
          <div key={i} className="bg-[#fafaf9] dark:bg-zinc-950/40 border border-[#e8e6e5] dark:border-zinc-800/40 rounded p-1.5 flex items-end gap-1.5 h-12 group-hover:border-[#3ba6f1]/40 transition-all duration-300">
            <div className="w-full bg-[#d6d3d1] dark:bg-zinc-800/80 rounded-t-sm transition-all duration-700 group-hover:bg-[#3ba6f1] group-hover:shadow-[0_0_12px_rgba(59,166,241,0.4)]" style={{ height: `${v}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 rounded-lg bg-[#f5f5f4] dark:bg-zinc-950/80 border border-[#e8e6e5] dark:border-zinc-800/80 w-fit mb-3 group-hover:border-[#3ba6f1]/50 group-hover:bg-blue-50/50 dark:group-hover:bg-zinc-900/80 transition-all duration-300">
        <Icon className="h-4 w-4 text-[#78716c] dark:text-zinc-400 group-hover:text-[#3ba6f1] transition-colors duration-300" />
      </div>
      <h3 className="font-semibold text-[#0c0a09] dark:text-zinc-100 text-base mb-1">{title}</h3>
      <p className="text-[#78716c] dark:text-zinc-500 text-[13px] leading-relaxed mb-4">{desc}</p>
      <div className="mt-auto overflow-x-auto rounded-lg border border-[#e8e6e5] dark:border-zinc-800/80 bg-[#fafaf9] dark:bg-zinc-950/40 p-3 font-mono text-[9px] text-[#78716c] dark:text-zinc-500 group-hover:border-[#3ba6f1]/40 transition-all duration-300 code-section">
        <div className="text-[#a8a29e] dark:text-zinc-600 mb-0.5 group-hover:text-zinc-500 transition-colors duration-300">{`// GET /api/v1/stats`}</div>
        <div className="text-[#0c0a09] dark:text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300">{"{"}</div>
        <div className="pl-3 text-[#78716c] dark:text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">{`"visitors"`}: <span className="text-emerald-600 dark:text-emerald-400/80 group-hover:text-emerald-400 transition-colors duration-300">1284</span>,</div>
        <div className="pl-3 text-[#78716c] dark:text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">{`"active"`}: <span className="text-amber-600 dark:text-amber-400/80 group-hover:text-amber-400 transition-colors duration-300">true</span></div>
        <div className="text-[#0c0a09] dark:text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300">{"}"}</div>
      </div>
    </div>
  );
}
