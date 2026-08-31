"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ShareBarList, ShareBarListContent, ShareBarListFill,
  ShareBarListItem, ShareBarListLabel, ShareBarListValue,
} from "@/components/dashboard/share-bar-list";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface BrowserShareProps {
  data?: { browser: string; visitors: number; share: number }[];
  projectId?: string;
}

export function BrowserShare({ data = [] }: BrowserShareProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? data : data.slice(0, 5);

  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3.5 border-b border-[#e8e6e5] dark:border-zinc-900/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold font-roobert tracking-tight text-[#0c0a09] dark:text-white">Browser Share</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 mt-0.5">
                Session distribution across browser engines
              </CardDescription>
            </div>
            <div className="text-xs font-mono font-medium text-[#78716c] dark:text-zinc-400 bg-[#f5f5f4] dark:bg-zinc-900/70 border border-[#e8e6e5] dark:border-zinc-800/60 px-2.5 py-0.5 rounded-lg">
              {data.length} {data.length === 1 ? "family" : "families"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 py-4">
          {displayRows.length > 0 ? (
            <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
              <ShareBarList aria-label="Sessions by browser">
                {displayRows.map((row) => (
                  <ShareBarListItem key={row.browser} value={row.share}>
                    <ShareBarListContent>
                      <ShareBarListLabel className="text-xs sm:text-sm font-medium text-[#0c0a09] dark:text-zinc-200">{row.browser}</ShareBarListLabel>
                      <ShareBarListValue className="text-xs sm:text-sm font-semibold text-[#78716c] dark:text-zinc-400">{row.share}%</ShareBarListValue>
                    </ShareBarListContent>
                    <ShareBarListFill />
                  </ShareBarListItem>
                ))}
              </ShareBarList>
            </div>
          ) : (
            <div className="text-center py-10 text-[#a8a29e] dark:text-zinc-500 font-mono text-xs">
              No browser telemetry recorded yet
            </div>
          )}
        </CardContent>
      </div>

      {data.length > 5 && (
        <div className="flex items-center justify-center py-2 px-4 border-t border-[#e8e6e5] dark:border-zinc-900/80 bg-[#fafaf9] dark:bg-zinc-950/40">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            <span>{expanded ? "Show less" : `View all (${data.length})`}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </Card>
  );
}
