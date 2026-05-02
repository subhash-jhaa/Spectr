"use client"
import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Code2, Star,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button, fadeUp, staggerContainer, SectionLabel } from './Primitives';


export function Hero() {
  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="relative mx-auto max-w-full overflow-hidden min-h-screen flex flex-col items-center justify-center"
    >
      {/* Background Image - Fit full screen with cover */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />
      {/* Minimalist Overlay: Only a very subtle gradient at the top for navbar visibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-32 text-center flex flex-col items-center justify-center min-h-[85vh]">
        <motion.h1
          variants={fadeUp} custom={1}
          className="mx-auto max-w-4xl text-[3.2rem] sm:text-[5.5rem] font-bold tracking-tight text-zinc-950 leading-[1.05] mb-6"
        >
          See Who&apos;s On Your<br />
          Site <span className="text-zinc-600">Right Now.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp} custom={2}
          className="mx-auto max-w-xl text-base sm:text-lg text-zinc-600 mb-10 leading-relaxed font-medium"
        >
          Privacy-first, zero-cookie analytics built for developers. Know who&apos;s visiting, where they came from, and exactly what they&apos;re doing.
        </motion.p>

        <motion.div
          variants={fadeUp} custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto h-14 px-10 rounded-xl bg-zinc-950 text-white font-semibold text-base flex items-center justify-center gap-2 group transition-shadow shadow-xl relative overflow-hidden"
            >
              <span className="relative z-10">Start Tracking Free</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </Link>
          <Link href="#how-it-works">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto h-14 px-10 rounded-xl border border-zinc-600 bg-white/50 backdrop-blur-sm text-zinc-950 font-semibold text-base flex items-center justify-center gap-2 hover:bg-white hover:border-zinc-300 transition-all"
            >
              <Code2 className="h-4 w-4 text-zinc-500 border-2 " /> See How It Works
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Hero Bottom Info */}
      <div className="absolute bottom-10 left-0 right-0 z-20 px-8 flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-none">
        <div className="max-w-md text-left pointer-events-auto">
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-white text-white" />)}
          </div>
          <p className="text-sm font-medium text-white leading-relaxed">
            Trusted by 500+ developers for privacy-first, real-time insights.
          </p>
        </div>

        <div className="flex gap-8 text-sm font-semibold text-white pointer-events-auto">
          <a href="https://linkedin.com/in/subhashjhadev" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Linkedin</a>
          <a href="https://x.com/subhash-jh" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">X</a>
        </div>
      </div>
    </motion.section>
  );
}

// Helper Link component to handle next/link import if needed
import Link from 'next/link';
