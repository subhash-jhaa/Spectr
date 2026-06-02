"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code2 } from "lucide-react";
import Link from "next/link";
import { FloatingPaths } from "@/components/ui/background-paths";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export function Hero() {
  return (
    <section className="relative w-full h-[100dvh] min-h-[600px] bg-black overflow-hidden">
      {/* Full-screen Container */}
      <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
        
        {/* Background Video */}
        {/* <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/bgv3.mp4"
            type="video/mp4"
          />
        </video> */}

        {/* Gradient Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10" /> */}

         {/* Background Paths */}
        <div className="absolute inset-0 z-0 opacity-40">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>



        {/* Bottom-left Aligned Hero Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="absolute bottom-0 left-0 right-0 p-6 pb-20 md:p-12 lg:p-16 z-20 flex flex-col items-start text-left max-w-4xl gap-6 select-none"
        >
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-bold tracking-tight text-white leading-[1.05] text-[10vw] sm:text-[8vw] md:text-[6vw] lg:text-[4.5vw] xl:text-[4.2vw] 2xl:text-[4.5vw]"
          >
            Real-time analytics<br />
             <span className="text-[#DEDBC8]"> for your site.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl font-medium"
          >
            Privacy-first, zero-cookie analytics built for developers. Know who&apos;s visiting, where they came from, and exactly what they&apos;re doing.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-2"
          >
            <Link href="/auth" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto h-12 px-6 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 group transition-all cursor-pointer whitespace-nowrap shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
              >
                <span>Start Tracking Free</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto h-12 px-6 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <Code2 className="h-4 w-4 text-white" /> See How It Works
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
