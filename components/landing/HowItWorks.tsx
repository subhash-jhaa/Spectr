"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionValue } from 'framer-motion';
import { fadeUp, staggerContainer, SectionLabel } from './Primitives';
import { STEPS } from './Constants';
import Image from 'next/image';

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
      className="h-auto md:h-[80vh] flex items-start justify-center relative md:sticky md:top-28 w-full mb-6 md:mb-0" 
      style={{ zIndex: i + 1 }}
    >
      {/* Card */}
      <motion.div 
        style={isMobile ? {} : { scale, y: i * 25 }}
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
                 <Image src={step.image} alt={step.title} fill className="object-cover" unoptimized />
               </motion.div>
            )}
          </div>

          {/* Right: Tags & Desc */}
          <div className="w-full md:w-[45%] flex flex-col justify-center">
            <div className="flex flex-col gap-4 mb-8">
              {step.tags && step.tags.map((tag: string, j: number) => (
                <div key={j} className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 bg-[#DEDBC8] rotate-45 flex-shrink-0" />
                  <span className="text-zinc-400 text-sm sm:text-base font-medium">{tag}</span>
                </div>
              ))}
            </div>
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

  // Calculate active step based on scroll progress and midpoints
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const totalSteps = STEPS.length;
    if (totalSteps <= 1) return;
    
    let active = 0;
    for (let i = 0; i < totalSteps - 1; i++) {
      const boundary = (i + 0.5) / (totalSteps - 1);
      if (latest >= boundary) {
        active = i + 1;
      }
    }
    
    if (active !== activeIndex) {
      setActiveIndex(active);
    }
  });

  return (
    <section id="how-it-works" ref={container} className="relative w-full py-20 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="text-center mb-16 sm:mb-24 px-4"
      >
        <motion.div variants={fadeUp} custom={0}>
          <SectionLabel>Simple by design</SectionLabel>
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
        <div className="flex-1 relative">
          {STEPS.map((step, i) => {
            const targetScale = 1 - ((STEPS.length - 1 - i) * 0.04);
            return (
              <Card 
                key={i} 
                i={i} 
                step={step} 
                progress={scrollYProgress} 
                range={[i * 0.25, 1]} 
                targetScale={targetScale} 
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

