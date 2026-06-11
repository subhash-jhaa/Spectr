"use client";
import React from "react";
import { LiveFeed } from "./landing/HeroVisuals";
import { Counter } from "./landing/Stats";
import { STATS } from "./landing/Constants";

export function LiveVisitorFeed() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {/* Live Feed Card */}
      <LiveFeed />

      {/* Stats Counter Row */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {STATS.map(({ label, value }, i) => {
          const shortLabel = label.split(" ")[0]; // "Active", "Events", "Countries"
          return (
            <div key={i} className="bg-zinc-950/30 rounded-xl border border-zinc-800/80 p-3.5 flex flex-col items-start justify-center">
              <div className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono leading-none mb-1">
                <Counter value={value} />
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{shortLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
