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
    <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-zinc-950/70 border border-zinc-900/80 rounded-xl backdrop-blur-md hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-zinc-900/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold font-mono tracking-tight text-white">Browser Share</CardTitle>
              <CardDescription className="text-xs font-mono text-zinc-500 mt-0.5">
                Session distribution across browser engines
              </CardDescription>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/70 border border-zinc-800/60 px-2 py-0.5 rounded">
              {data.length} {data.length === 1 ? "family" : "families"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-3">
          {displayRows.length > 0 ? (
            <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
              <ShareBarList aria-label="Sessions by browser">
                {displayRows.map((row) => (
                  <ShareBarListItem key={row.browser} value={row.share}>
                    <ShareBarListContent>
                      <ShareBarListLabel className="text-xs font-mono text-zinc-300">{row.browser}</ShareBarListLabel>
                      <ShareBarListValue className="text-xs font-mono text-zinc-400 font-semibold">{row.share}%</ShareBarListValue>
                    </ShareBarListContent>
                    <ShareBarListFill />
                  </ShareBarListItem>
                ))}
              </ShareBarList>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500 font-mono text-xs">
              No browser telemetry recorded yet
            </div>
          )}
        </CardContent>
      </div>

      {data.length > 5 && (
        <div className="flex items-center justify-center py-2 px-4 border-t border-zinc-900/80 bg-zinc-950/40">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            <span>{expanded ? "Show less" : `View all (${data.length})`}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </Card>
  );
}
