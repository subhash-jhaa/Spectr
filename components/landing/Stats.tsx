"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn, MONO, fadeUp, staggerContainer } from "./Primitives";
import { STATS } from "./Constants";

function Counter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };

    function animate() {
      const cleanStr = value.replace(/,/g, "");
      const isK = cleanStr.toLowerCase().endsWith("k");
      let targetNumber = parseFloat(cleanStr);
      let suffix = "";

      if (isK) {
        targetNumber = parseFloat(cleanStr.slice(0, -1));
        suffix = "K";
      }

      const duration = 1500; // 1.5s
      const startTime = performance.now();

      function update(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuad easing
        const ease = progress * (2 - progress);
        const current = targetNumber * ease;

        let formatted = "";
        if (isK) {
          formatted = current.toFixed(1) + suffix;
        } else {
          formatted = Math.floor(current).toLocaleString();
        }

        setDisplayValue(formatted);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setDisplayValue(value);
        }
      }

      requestAnimationFrame(update);
    }
  }, [value]);

  return <span ref={ref}>{displayValue}</span>;
}

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {STATS.map(({ label, value, icon: Icon, unit }, i) => (
          <motion.div key={i} variants={fadeUp} custom={i} className="h-full">
            {/* Outer Box with Border & Hover Bg Transition */}
            <div className="bg-zinc-950/30 hover:bg-zinc-950/45 transition-all duration-700 rounded-2xl p-2 h-full relative overflow-hidden border border-zinc-800/80 group">
              {/* Inner Box with Subtle Border */}
              <div className="rounded-[14px] bg-zinc-950 border border-zinc-800/30 h-full transition-all duration-700 relative overflow-hidden w-full p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 group-hover:border-[#DEDBC8]/50 group-hover:bg-zinc-900/80 shrink-0 transition-all duration-300">
                  <Icon className="h-4 w-4 text-zinc-400 group-hover:text-[#DEDBC8] transition-colors duration-300" />
                </div>
                <div>
                  <div className={cn(MONO, "text-2xl font-bold text-zinc-100 leading-none mb-1")}>
                    <Counter value={value} />
                  </div>
                  <div className="text-sm font-medium text-zinc-300">{label}</div>
                  <div className={cn(MONO, "text-[11px] text-zinc-600 mt-0.5")}>{unit}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
