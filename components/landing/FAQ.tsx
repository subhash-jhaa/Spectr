"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className="border-b border-[#e8e6e5] dark:border-zinc-800 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left focus:outline-none group cursor-pointer"
      >
        <span className="text-lg sm:text-xl font-medium text-[#0c0a09] dark:text-zinc-100 group-hover:text-[#3ba6f1] dark:group-hover:text-white transition-colors duration-200">
          {question}
        </span>
        <span className="ml-4 flex-shrink-0 text-[#78716c] dark:text-zinc-500 group-hover:text-[#0c0a09] dark:group-hover:text-zinc-300 transition-colors duration-200">
          {isOpen ? (
            <Minus className="h-5 w-5 sm:h-6 sm:w-6 text-[#3ba6f1]" />
          ) : (
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-8 text-base sm:text-[17px] text-[#78716c] dark:text-zinc-300 leading-[1.65] font-normal">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Spectr track visitors without cookies or consent banners?",
      answer: "We use rotating daily cryptographic hashes that eliminate the need to persist unique identifiers on user devices. Because no cross-session personal data is stored, no cookie consent banner is legally required under GDPR, CCPA, and PECR.",
    },
    {
      question: "Will Spectr impact my site's page load speed or Core Web Vitals?",
      answer: "No. The tracking script is under 2KB gzipped and loads asynchronously with the defer attribute. It runs entirely off the main rendering path and has zero impact on Lighthouse scores.",
    },
    {
      question: "Can I use Spectr with Next.js, React, or static sites?",
      answer: "Yes! Spectr works with any web framework (Next.js App Router/Pages, Remix, Astro, Svelte, Vue) as well as plain static HTML and WordPress.",
    },
    {
      question: "How does Dev Console Mode work?",
      answer: "When enabled in development environments, Spectr outputs clean, formatted real-time event logs directly into your browser console, making it effortless to debug pageviews and custom conversion events without leaving your code.",
    },
    {
      question: "Can I export my analytics data?",
      answer: "Yes. Pro users can export all analytics data as CSV/JSON at any time or consume metrics programmatically via our open REST API.",
    },
  ];

  return (
    <section id="faq" className="relative py-20 sm:py-28 bg-[#fafaf9] dark:bg-black overflow-hidden border-t border-[#e8e6e5] dark:border-zinc-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest text-[#3ba6f1] uppercase">
            FAQ
          </span>
          <h2 className="font-roobert text-4xl sm:text-5xl md:text-[52px] font-normal text-[#0c0a09] dark:text-white tracking-[-0.025em] leading-[1.12] mt-2">
            <span>Got questions? </span>
            <span className="highlight-span">Clear answers</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg md:text-[18px] font-normal text-[#78716c] dark:text-zinc-400 leading-[1.64]">
            Have questions about integration, privacy, or custom events? Find quick answers to common developer queries here.
          </p>
        </div>

        {/* Accordions Card Container */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-white dark:bg-zinc-950/50 border border-[#e8e6e5] dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none p-6 sm:p-8 divide-y divide-[#e8e6e5] dark:divide-zinc-800">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default FAQ;
