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
      <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-lg mb-4 relative overflow-hidden">
        {(['HTML', 'React', 'Vue', 'Svelte'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer z-10 ${
                isActive ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabHighlight"
                  className="absolute inset-0 bg-[#DEDBC8] rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Code window */}
      <div className="relative rounded-lg border border-zinc-800/80 bg-zinc-950/80 p-3.5 font-mono text-[11px] text-zinc-300 min-h-[140px] flex flex-col justify-center">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-900 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-zinc-800" />
            <div className="h-2 w-2 rounded-full bg-zinc-800" />
            <div className="h-2 w-2 rounded-full bg-zinc-800" />
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
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
          className="absolute top-10 right-3.5 p-1.5 rounded border border-zinc-800/60 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer shadow-md"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
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
        className="relative w-full rounded-xl border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-md overflow-hidden shadow-xl origin-top flex flex-col"
      >
        {/* Card Top: Title & Mobile Step */}
        <div className="p-6 sm:p-8 border-b border-zinc-800/50 flex justify-between items-center">
          <h3 className="text-xl sm:text-2xl font-medium text-zinc-100">
            {step.title}
          </h3>
          <span className="lg:hidden text-[#DEDBC8] font-mono font-bold text-lg">
            0{i + 1}
          </span>
        </div>
        
        {/* Card Bottom: Split Content */}
        <div className="flex flex-col md:flex-row p-6 sm:p-8 gap-8 sm:gap-10 items-center">
          {/* Left: Image */}
          <div className="w-full md:w-[55%] relative h-48 sm:h-64 md:h-[300px] lg:h-[350px] rounded-xl overflow-hidden bg-zinc-900/50">
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
              <div className="flex flex-col gap-4 mb-8">
                {step.tags && step.tags.map((tag: string, j: number) => (
                  <div key={j} className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 bg-[#DEDBC8] rotate-45 flex-shrink-0" />
                    <span className="text-zinc-400 text-sm sm:text-base font-medium">{tag}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-zinc-500 text-sm sm:text-base leading-relaxed">
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
        <motion.div variants={fadeUp} custom={0} className="mb-2">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#DEDBC8]/60 uppercase">
            Simple by design
          </span>
        </motion.div>
        <motion.h2 variants={fadeUp} custom={1} className="font-mono text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mt-1">
          How It Works
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="mt-3 text-sm text-zinc-500 max-w-xs mx-auto">
          Three steps from zero to live analytics in your dashboard.
        </motion.p>
      </motion.div>

      {/* Main Grid: Left side sticky step indicator, Right side scrolling cards */}
      <div className="relative px-4 sm:px-6 mt-10 max-w-6xl mx-auto flex gap-12">
        {/* Left Side: Sticky Step Number (Desktop only) */}
        <div className="hidden lg:flex flex-col items-end w-48 shrink-0 h-[80vh] sticky top-28 pt-8">
          <div className="flex items-center gap-4">
            <span className="text-[#DEDBC8] font-semibold text-sm tracking-widest">STEP</span>
            <div className="relative h-[180px] w-28 overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={activeIndex}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute text-[#1a1a1a] text-[180px] font-bold leading-none tracking-tighter"
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
                    <div className="h-10 md:h-12 w-px border-l-2 border-dashed border-zinc-800/80" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800/80 -mt-0.5" />
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

