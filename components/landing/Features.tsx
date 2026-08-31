"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn, SectionLabel, fadeUp } from './Primitives';
import { FEATURES } from './Constants';
import { LiveGlobeCard } from './LiveGlobeCard';
import { CobeGlobe } from '@/components/cobe-globe';
import { Check } from 'lucide-react';

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20 sm:pt-12 sm:pb-28">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <SectionLabel>Built for developers</SectionLabel>
        <h2 className="font-roobert text-4xl sm:text-5xl md:text-[54px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.025em] leading-[1.12] mt-2">
          <span>Everything you need — </span>
          <span className="highlight-span">zero bloat</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg md:text-[19px] font-normal text-[#78716c] dark:text-zinc-400 max-w-xl mx-auto leading-[1.65]">
          No bloated dashboards. No enterprise pricing. Fast, clean analytics that stay out of your way.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}

type FeatureVariant = 'realtime' | 'privacy' | 'dashboard' | 'presence';

interface Feature {
  readonly icon: React.ElementType;
  readonly title: string;
  readonly desc: string;
  readonly variant: FeatureVariant;
  readonly span: number;
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { span } = feature;

  // Map glow colors based on variant
  const glowColors: Record<FeatureVariant, string> = {
    realtime: 'from-blue-500/10 to-transparent',
    privacy: 'from-rose-500/10 to-transparent',
    dashboard: 'from-blue-500/10 to-transparent',
    presence: 'from-cyan-500/10 to-transparent',
  };

  const glowColor = glowColors[feature.variant];

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
      <div className="bg-white/80 dark:bg-zinc-950/30 hover:bg-[#fafaf9] dark:hover:bg-zinc-950/45 transition-all duration-500 rounded-3xl p-2.5 h-full relative overflow-hidden border border-[#e8e6e5] dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none group">
        {/* Inner Box with Subtle Border & backdrop blur */}
        <div className="rounded-[18px] bg-white dark:bg-zinc-950 border border-[#e8e6e5]/60 dark:border-zinc-800/30 h-full transition-all duration-500 relative overflow-hidden w-full p-6 sm:p-8 flex flex-col justify-between">

          {/* Backdrop Glow Effect on Hover */}
          <div className={cn(
            "-bottom-40 md:-bottom-64 left-[50%] -translate-x-[50%] opacity-0 group-hover:opacity-100 z-0 absolute bg-gradient-to-t blur-[4rem] md:blur-[6rem] rounded-full transition-all duration-700 ease-out w-40 md:w-96 h-40 md:h-96 pointer-events-none",
            glowColor
          )} />

          <FeatureContent feature={feature} />
        </div>
      </div>
    </motion.div>
  );
}

function FeatureContent({ feature }: { feature: Feature }) {
  switch (feature.variant) {
    case 'realtime': return <RealtimeFeature feature={feature} />;
    case 'privacy': return <PrivacyFeature feature={feature} />;
    case 'dashboard': return <DashboardFeature feature={feature} />;
    case 'presence': return <PresenceFeature feature={feature} />;
    default: return null;
  }
}

function RealtimeFeature({ feature }: { feature: Feature }) {
  return <LiveGlobeCard />;
}

function PrivacyFeature({ feature: { title, desc } }: { feature: Feature }) {
  return (
    <div className="relative overflow-hidden w-full h-full min-h-[300px] flex flex-col justify-between">
      {/* Top Right Badge */}
      <div className="absolute top-0 right-0 z-20">
        <span className="inline-flex items-center rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-[#f5f5f4] dark:bg-zinc-900/90 px-3 py-1 text-xs sm:text-[13px] font-mono text-[#78716c] dark:text-zinc-300 font-normal shadow-sm">
          no setup required
        </span>
      </div>

      {/* Header & Title */}
      <div className="relative z-10">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 text-[#3ba6f1] w-fit mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 sm:h-6 sm:w-6 text-[#3ba6f1]">
            <path fillRule="evenodd" clipRule="evenodd" d="M1.842 14.219c0-5.614 4.549-10.164 10.16-10.164 5.61 0 10.16 4.55 10.16 10.164a4.054 4.054 0 1 1-8.108 0 2.054 2.054 0 1 0-4.107 0A8.158 8.158 0 0 0 13.8 21.15a1 1 0 1 1-1.059 1.697 10.158 10.158 0 0 1-4.793-8.63 4.054 4.054 0 1 1 8.107 0 2.054 2.054 0 1 0 4.108 0 8.162 8.162 0 0 0-8.16-8.163 8.162 8.162 0 0 0-8.16 8.164c0 1.053.118 2.08.335 3.071a1 1 0 0 1-1.954.429 16.325 16.325 0 0 1-.381-3.5Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M11.999 9.11a5.108 5.108 0 0 0-5.107 5.109c0 2.393.75 4.607 2.027 6.428a1 1 0 1 1-1.638 1.148 13.159 13.159 0 0 1-2.389-7.576A7.108 7.108 0 0 1 12 7.109a7.108 7.108 0 0 1 7.106 7.11 1 1 0 0 1-2 0 5.108 5.108 0 0 0-5.106-5.11Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M12 13.219a1 1 0 0 1 1 1 5.108 5.108 0 0 0 5.107 5.109c.046 0 .078-.002.133-.006l.14-.009a1 1 0 0 1 .111 1.997l-.05.003c-.081.006-.217.015-.334.015a7.108 7.108 0 0 1-7.106-7.11 1 1 0 0 1 1-1ZM2.724 5.202A12.327 12.327 0 0 1 12 1c3.7 0 7.013 1.632 9.276 4.202a1 1 0 1 1-1.501 1.322A10.327 10.327 0 0 0 12 3a10.327 10.327 0 0 0-7.775 3.524 1 1 0 1 1-1.501-1.322Z" fill="currentColor" />
          </svg>
        </div>
        <h3 className="font-roobert font-semibold text-[#0c0a09] dark:text-white text-xl sm:text-2xl mb-2.5">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-[#78716c] dark:text-zinc-400 max-w-[375px] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function DashboardFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className="grid h-full sm:grid-cols-2 -m-6 sm:-m-8 min-h-[300px]">
      <div className="relative z-10 space-y-5 p-6 sm:p-8 flex flex-col justify-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-[#f5f5f4] dark:bg-zinc-900 shadow-xs outline outline-[#e8e6e5]/80 dark:outline-zinc-800/80 outline-offset-2">
          <Icon className="size-5 text-[#3ba6f1]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-roobert font-semibold text-[#0c0a09] dark:text-white text-xl sm:text-2xl">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-[#78716c] dark:text-zinc-400 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>

      {/* Dashboard Screen */}
      <div className="relative min-h-[220px] sm:min-h-full flex items-center justify-end p-4 sm:p-6 sm:pl-0">
        <div className="w-full h-full max-h-[240px] rounded-xl border border-[#e8e6e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-lg overflow-hidden flex items-center justify-center">
          <div className="relative w-full h-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-950">
            {/* Light Mode: White Dashboard */}
            <div className="dark:hidden relative w-full h-full">
              <Image
                src="https://storage.efferd.com/screen/dashboard-light.webp"
                alt="Spectr Dashboard Light Preview"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-center"
                unoptimized
              />
            </div>

            {/* Dark Mode: Dark Spectr Dashboard */}
            <div className="hidden dark:block relative w-full h-full">
              <Image
                src="https://storage.efferd.com/screen/dashboard-dark.webp"
                alt="Spectr Dashboard Dark Preview"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-center"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresenceFeature({ feature: { icon: Icon, title, desc } }: { feature: Feature }) {
  return (
    <div className="grid h-full sm:grid-cols-2 -m-6 sm:-m-8 min-h-[300px]">
      <div className="relative z-10 space-y-5 p-6 sm:p-8 flex flex-col justify-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-[#f5f5f4] dark:bg-zinc-900 shadow-xs outline outline-[#e8e6e5]/80 dark:outline-zinc-800/80 outline-offset-2">
          <Icon className="size-5 text-[#3ba6f1]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-roobert font-semibold text-[#0c0a09] dark:text-white text-xl sm:text-2xl">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-[#78716c] dark:text-zinc-400 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[240px] sm:min-h-full">
        <CobeGlobe className="-top-[12%] right-0 sm:absolute pointer-events-none" />
      </div>
    </div>
  );
}
