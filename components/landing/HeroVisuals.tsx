"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal, Copy, Check,
} from 'lucide-react';
import { cn, CARD, MONO, fadeUp, staggerContainer, fadeIn, scaleIn } from './Primitives';
import { VISITORS } from './Constants';

function FlagIcon({ code }: { code: string }) {
  return (
    <span className={cn(MONO, "text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5")}>
      {code}
    </span>
  );
}

export function LiveFeed() {
  const [rows, setRows] = useState(VISITORS.slice(0, 4));
  const [tick, setTick] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTick(p => !p);
      setRows([...VISITORS].sort(() => Math.random() - 0.5).slice(0, 4));
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div variants={scaleIn} className={cn(CARD, "w-full max-w-md mx-auto overflow-hidden relative shadow-2xl bg-zinc-950/40 code-section")}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-500" />
          <span className={cn(MONO, "text-xs text-zinc-400")}>live_visitors.log</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-emerald-400"
            style={{ boxShadow: tick ? '0 0 10px #34d399' : '0 0 4px #34d399', transition: 'box-shadow 0.4s' }}
          />
          <span className="text-[11px] text-zinc-600 font-mono">LIVE</span>
        </div>
      </div>
      <div className="relative">
        <div className="divide-y divide-zinc-800/40 bg-transparent">
          {rows.map((v, i) => (
            <motion.div
              key={`${v.flag}-${v.page}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center justify-between px-4 py-2.5 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FlagIcon code={v.flag} />
                <span className={cn(MONO, "text-zinc-300 truncate")}>{v.page}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 pl-3">
                <span className="text-zinc-600 hidden sm:block">{v.device}</span>
                <span className={cn(MONO, "text-zinc-500 text-[11px]")}>{v.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Sticky gradient fade to hint at more content scrolling below */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950/90 to-transparent pointer-events-none" />
      </div>
      <div className="px-4 py-2.5 border-t border-zinc-800/80 flex items-center gap-2 bg-zinc-950/20">
        <span className={cn(MONO, "text-[11px] text-emerald-400")}>●</span>
        <span className="text-[11px] text-zinc-500">Streaming 1,284 active sessions</span>
      </div>
    </motion.div>
  );
}

const ONE_LINER = '<script src="https://spectr.subhashjha.me/track.js" data-site="YOUR_SITE_ID" defer></script>';

export function HeroScript() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(ONE_LINER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = [
    { tokens: [{ t: '<', c: 'text-zinc-500' }, { t: 'script', c: 'text-sky-400' }] },
    { tokens: [{ t: '  src', c: 'text-violet-400' }, { t: '=', c: 'text-zinc-500' }, { t: '"https://spectr.subhashjha.me/track.js"', c: 'text-emerald-400' }] },
    { tokens: [{ t: '  data-site', c: 'text-violet-400' }, { t: '=', c: 'text-zinc-500' }, { t: '"YOUR_SITE_ID"', c: 'text-amber-400' }] },
    { tokens: [{ t: '  defer', c: 'text-violet-400' }] },
    { tokens: [{ t: '>', c: 'text-zinc-500' }, { t: '</', c: 'text-zinc-500' }, { t: 'script', c: 'text-sky-400' }, { t: '>', c: 'text-zinc-500' }] },
  ];

  return (
    <motion.div variants={scaleIn} className={cn(CARD, "w-full max-w-lg mx-auto overflow-hidden shadow-2xl bg-zinc-950/40 code-section")}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/20">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
          <span className={cn(MONO, "ml-2 text-[11px] text-zinc-600")}>index.html</span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-200 transition-colors px-2 py-1 rounded border border-zinc-800/60 hover:border-zinc-700 bg-zinc-950/30"
        >
          {copied
            ? <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
            : <><Copy className="h-3 w-3" /><span>Copy</span></>}
        </button>
      </div>
      <div className="px-5 py-4 bg-zinc-950/50 overflow-x-auto">
        <pre className={cn(MONO, "text-sm leading-relaxed whitespace-pre")}>
          {lines.map((line, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1), duration: 0.5 }}
            >
              {line.tokens.map((tok, j) => (
                <span key={j} className={tok.c}>{tok.t}</span>
              ))}
            </motion.div>
          ))}
        </pre>
      </div>
      <div className="flex items-center gap-2 px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/20 flex-wrap">
        {['< 2KB', 'No dependencies', 'Open source'].map((b, i) => (
          <motion.span 
            key={b} 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 + (i * 0.1) }}
            className={cn(MONO, "text-[10px] text-zinc-500 border border-zinc-800/40 rounded px-2 py-0.5 bg-zinc-950/30")}
          >
            {b}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export function HeroVisuals() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="bg-zinc-950/30 rounded-2xl p-2 relative z-10 border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.3)] shadow-inner"
      >
        <div className="rounded-[14px] bg-zinc-950 border border-zinc-800/30 backdrop-blur-md p-6 sm:p-10 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative overflow-hidden">
          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <div className="text-left flex items-center gap-3 mb-2">
              <div className="h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 font-mono">Step 1 — Install</p>
            </div>
            <HeroScript />
            <motion.div variants={fadeIn} className="flex items-center gap-2 text-xs text-zinc-600 px-1 pt-2">
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>Works with React, Next.js, Vue, or plain HTML</span>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <div className="text-left flex items-center gap-3 mb-2">
              <div className="h-4 w-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                 <div className="h-full w-full bg-gradient-to-tr from-zinc-800 to-zinc-700 animate-pulse" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 font-mono">Step 2 — Watch it live</p>
            </div>
            <LiveFeed />
            <motion.div variants={fadeIn} className="flex items-center gap-2 text-xs text-zinc-600 px-1 pt-2">
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>Data appears within seconds of installing</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
