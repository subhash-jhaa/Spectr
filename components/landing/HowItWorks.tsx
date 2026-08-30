"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from 'framer-motion';
import { fadeUp, staggerContainer } from './Primitives';
import { STEPS } from './Constants';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';

const SNIPPETS = {
  HTML: `<script \n  src="https://spectr.subhashjha.me/track.js"\n  data-site="YOUR_SITE_ID"\n  defer\n></script>`,
  React: `import { SpectrProvider } from 'spectr-react';\n\n<SpectrProvider siteId="YOUR_SITE_ID">\n  <App />\n</SpectrProvider>`,
  Vue: `import { createApp } from 'vue';\nimport { spectrPlugin } from 'spectr';\n\nconst app = createApp(App);\napp.use(spectrPlugin, {\n  siteId: 'YOUR_SITE_ID'\n});`,
  Svelte: `<script>\n  import { initSpectr } from 'spectr-svelte';\n  import { onMount } from 'svelte';\n\n  onMount(() => {\n    initSpectr('YOUR_SITE_ID');\n  });\n</script>`
};

function Step1Tabs() {
  const [activeTab, setActiveTab] = useState<'HTML' | 'React' | 'Vue' | 'Svelte'>('HTML');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col mb-6 w-full">
      {/* Tabs list */}
      <div className="flex gap-1.5 p-1.5 bg-[#f5f5f4] dark:bg-zinc-900/60 border border-[#e8e6e5] dark:border-zinc-800/80 rounded-xl mb-4 relative overflow-hidden">
        {(['HTML', 'React', 'Vue', 'Svelte'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2 text-xs sm:text-sm font-mono font-medium rounded-lg transition-colors cursor-pointer z-10 ${
                isActive ? 'text-[#0c0a09] dark:text-zinc-950 font-bold' : 'text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabHighlight"
                  className="absolute inset-0 bg-[#c1e1f7] dark:bg-[#DEDBC8] rounded-lg -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Code window */}
      <div className="relative rounded-xl border border-[#e8e6e5] dark:border-zinc-800/80 bg-[#fafaf9] dark:bg-zinc-950/80 p-4 font-mono text-xs sm:text-[13px] text-[#0c0a09] dark:text-zinc-200 min-h-[160px] flex flex-col justify-center shadow-inner">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#e8e6e5] dark:border-zinc-900 mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#d6d3d1] dark:bg-zinc-800" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#d6d3d1] dark:bg-zinc-800" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#d6d3d1] dark:bg-zinc-800" />
          </div>
          <span className="text-xs text-[#78716c] dark:text-zinc-500 uppercase tracking-wider font-semibold">
            {activeTab === 'HTML' ? 'index.html' : activeTab === 'React' ? 'App.tsx' : activeTab === 'Vue' ? 'main.js' : 'layout.svelte'}
          </span>
        </div>
        
        {/* Code content */}
        <div className="overflow-x-auto pr-8">
          <pre className="leading-relaxed whitespace-pre font-mono">
            {SNIPPETS[activeTab]}
          </pre>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-11 right-4 p-2 rounded-lg border border-[#e8e6e5] dark:border-zinc-800/60 hover:border-[#d6d3d1] dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-zinc-200 transition-all cursor-pointer shadow-sm"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

const Card = ({ step, i, progress, range, targetScale }: {
  step: { n?: string; title: string; desc: string; tags?: string[]; image?: string };
  i: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start']
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div 
      ref={container} 
      className="h-[75vh] md:h-[80vh] flex items-start justify-center relative sticky top-20 md:top-28 w-full mb-6 md:mb-0" 
      style={{ zIndex: i + 1 }}
    >
      {/* Card */}
      <motion.div 
        style={{ scale, y: isMobile ? i * 12 : i * 25 }}
        className="relative w-full rounded-2xl sm:rounded-3xl border border-[#e8e6e5] dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md overflow-hidden shadow-xl origin-top flex flex-col"
      >
        {/* Card Top: Title & Mobile Step */}
        <div className="p-6 sm:p-8 border-b border-[#e8e6e5] dark:border-zinc-800/50 flex justify-between items-center">
          <h3 className="text-2xl sm:text-3xl font-roobert font-normal text-[#0c0a09] dark:text-white tracking-[-0.021em]">
            {step.title}
          </h3>
          <span className="lg:hidden text-[#3ba6f1] dark:text-[#DEDBC8] font-mono font-bold text-xl">
            0{i + 1}
          </span>
        </div>
        
        {/* Card Bottom: Split Content */}
        <div className="flex flex-col md:flex-row p-6 sm:p-8 gap-8 sm:gap-10 items-center">
          {/* Left: Image */}
          <div className="w-full md:w-[55%] relative h-48 sm:h-64 md:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden bg-[#fafaf9] dark:bg-zinc-900/50 border border-[#e8e6e5] dark:border-transparent">
            {step.image && (
               <motion.div style={{ scale: imageScale }} className="w-full h-full relative">
                 <Image
                   src={step.image}
                   alt={step.title}
                   fill
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 40vw"
                   className="object-cover"
                   priority={i === 0}
                 />
               </motion.div>
            )}
          </div>

          {/* Right: Tags & Desc */}
          <div className="w-full md:w-[45%] flex flex-col justify-center">
            {i === 0 ? (
              <Step1Tabs />
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                {step.tags && step.tags.map((tag: string, j: number) => (
                  <div key={j} className="flex items-center gap-3.5">
                    <div className="w-2 h-2 bg-[#3ba6f1] dark:bg-[#DEDBC8] rotate-45 flex-shrink-0" />
                    <span className="text-[#0c0a09] dark:text-zinc-200 text-base sm:text-lg font-medium">{tag}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[#78716c] dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal">
              {step.desc}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function HowItWorks() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Synchronize active step counter with scroll position
  useEffect(() => {
    const updateActive = (latest: number) => {
      const totalSteps = STEPS.length;
      if (totalSteps <= 1) return;
      
      let active = 0;
      // Distribute the 3 steps evenly across the scroll range
      if (latest >= 0.66) {
        active = 2;
      } else if (latest >= 0.33) {
        active = 1;
      } else {
        active = 0;
      }
      
      setActiveIndex(active);
    };

    // Initialize state on mount
    updateActive(scrollYProgress.get());

    // Subscribe to scroll value changes
    const unsubscribe = scrollYProgress.on("change", updateActive);
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section id="how-it-works" ref={container} className="relative w-full py-20 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="text-center mb-16 sm:mb-24 px-4"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#3ba6f1] uppercase">
            Simple by design
          </span>
        </motion.div>
        <motion.h2 variants={fadeUp} custom={1} className="font-roobert text-4xl sm:text-5xl md:text-[52px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.021em] leading-[1.12] mt-1">
          <span>How it works — </span>
          <span className="highlight-span">live in 3 steps</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="mt-4 text-base sm:text-lg md:text-[18px] text-[#78716c] dark:text-zinc-400 max-w-xl mx-auto leading-[1.64] font-normal">
          Three effortless steps from zero configuration to real-time analytics streaming in your dashboard.
        </motion.p>
      </motion.div>

      {/* Main Grid: Left side sticky step indicator, Right side scrolling cards */}
      <div className="relative px-4 sm:px-6 mt-10 max-w-6xl mx-auto flex gap-12">
        {/* Left Side: Sticky Step Number (Desktop only) */}
        <div className="hidden lg:flex flex-col items-end w-48 shrink-0 h-[80vh] sticky top-28 pt-8">
          <div className="flex items-center gap-4">
            <span className="text-[#3ba6f1] dark:text-[#DEDBC8] font-semibold text-sm tracking-widest">STEP</span>
            <div className="relative h-[180px] w-28 overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={activeIndex}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute text-[#e8e6e5] dark:text-[#1a1a1a] text-[180px] font-bold leading-none tracking-tighter"
                >
                  {activeIndex + 1}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Stacking Cards */}
        <div className="flex-1 relative flex flex-col">
          {STEPS.map((step, i) => {
            const targetScale = 1 - ((STEPS.length - 1 - i) * 0.04);
            return (
              <React.Fragment key={i}>
                <Card 
                  i={i} 
                  step={step} 
                  progress={scrollYProgress} 
                  range={[i * 0.25, 1]} 
                  targetScale={targetScale} 
                />
                
                {/* Connecting Line/Flow Indicator */}
                {i < STEPS.length - 1 && (
                  <div className="flex flex-col items-center justify-center md:-mt-4 md:mb-4 my-3 relative z-0 pointer-events-none">
                    <div className="h-10 md:h-12 w-px border-l-2 border-dashed border-[#e8e6e5] dark:border-zinc-800/80" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d6d3d1] dark:bg-zinc-800/80 -mt-0.5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

