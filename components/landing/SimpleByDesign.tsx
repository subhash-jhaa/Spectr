"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function SimpleByDesign() {
  return (
    <section className="w-full py-20 sm:py-28 bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

        {/* Moving Boxes Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center justify-center mb-12 relative"
        >
          <div className="relative w-full max-w-[820px] md:max-w-[960px] lg:max-w-[1060px] aspect-[1235/550]">
            <Image
              src="/seline-boxes.png"
              alt="Spectr simple by design"
              fill
              priority
              className="object-contain drop-shadow-2xl dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            />
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Headline */}
          <h2 className="font-roobert text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.025em] leading-[1.15]">
            <span>Get Spectr running in minutes. </span>
            <span className="highlight-span">Simple by design.</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg md:text-[19px] text-[#78716c] dark:text-zinc-300 leading-[1.65] font-normal max-w-[640px]">
            Spectr focuses <span className="italic font-medium text-[#0c0a09] dark:text-white">hard</span> on simplicity, minimalism, and ease of use. There&apos;s absolutely no need to deal with complicated dashboards that only slow you down.
          </p>

          {/* Get Started Button */}
          <div className="mt-8">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-full bg-[#3ba6f1] hover:bg-[#3398e1] border border-[#3398e1] text-white px-7 py-3.5 text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default SimpleByDesign;
