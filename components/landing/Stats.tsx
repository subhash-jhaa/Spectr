"use client"
import { motion } from 'framer-motion';
import { cn, MONO, fadeUp, staggerContainer } from './Primitives';
import { STATS } from './Constants';

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
          <motion.div 
            key={i} 
            variants={fadeUp}
            custom={i}
            className="h-full"
          >
            {/* Outer Box with Border & Hover Bg Transition */}
            <div className="bg-zinc-950/30 hover:bg-zinc-950/45 transition-all duration-700 rounded-2xl p-2 h-full relative overflow-hidden border border-zinc-800/80 group">
              {/* Inner Box with Subtle Border */}
              <div className="rounded-[14px] bg-zinc-950 border border-zinc-800/30 h-full transition-all duration-700 relative overflow-hidden w-full p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 group-hover:border-[#DEDBC8]/50 group-hover:bg-zinc-900/80 shrink-0 transition-all duration-300">
                  <Icon className="h-4 w-4 text-zinc-400 group-hover:text-[#DEDBC8] transition-colors duration-300" />
                </div>
                <div>
                  <div className={cn(MONO, "text-2xl font-bold text-zinc-100 leading-none mb-1")}>{value}</div>
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
