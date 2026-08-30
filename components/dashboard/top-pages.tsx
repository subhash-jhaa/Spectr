"use client";

import { useState, useMemo } from "react";
import { formatInteger } from "@/components/dashboard/formater";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export interface TopPagesProps {
  data?: { pageUrl: string; visitors: number; pageViews: number }[];
  projectId?: string;
}

const getPagePath = (url: string) => {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).pathname || "/";
  } catch {
    return url || "/";
  }
};

export function TopPages({ data = [] }: TopPagesProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? data : data.slice(0, 5);

  const maxViews = useMemo(() => {
    return data.reduce((max, item) => Math.max(max, item.pageViews || item.visitors || 0), 0) || 1;
  }, [data]);

  return (
    <Card className="relative md:col-span-2 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3.5 border-b border-[#e8e6e5] dark:border-zinc-900/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold font-roobert tracking-tight text-[#0c0a09] dark:text-white">Top Pages</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 mt-0.5">
                Most visited URLs in the last 7 days
              </CardDescription>
            </div>
            <div className="text-xs font-mono font-medium text-[#78716c] dark:text-zinc-400 bg-[#f5f5f4] dark:bg-zinc-900/70 border border-[#e8e6e5] dark:border-zinc-800/60 px-2.5 py-0.5 rounded-lg">
              {data.length} {data.length === 1 ? "page" : "pages"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
            <Table>
              <TableHeader className="bg-[#fafaf9] dark:bg-zinc-950/60">
                <TableRow className="border-b border-[#e8e6e5] dark:border-zinc-900 hover:bg-transparent text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 font-medium">
                  <TableHead className="pl-4 h-9 text-[#78716c] dark:text-zinc-400 font-semibold">Path</TableHead>
                  <TableHead className="text-right pr-4 h-9 w-28 text-[#78716c] dark:text-zinc-400 font-semibold">Visitors</TableHead>
                  <TableHead className="text-right pr-4 h-9 w-28 text-[#78716c] dark:text-zinc-400 font-semibold">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.length > 0 ? (
                  displayRows.map((row, idx) => {
                    const barPercentage = Math.max(2, ((row.pageViews || row.visitors) / maxViews) * 100);
                    const path = getPagePath(row.pageUrl);

                    return (
                      <TableRow
                        key={row.pageUrl + idx}
                        className="group relative border-b border-[#e8e6e5]/60 dark:border-zinc-900/50 hover:bg-[#f5f5f4] dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="pl-4 py-3 relative max-w-[240px]">
                          {/* Background visual proportional bar */}
                          <div
                            className="absolute inset-y-1 left-0 bg-[#3ba6f1]/10 dark:bg-zinc-800/20 rounded pointer-events-none transition-all duration-300 group-hover:bg-[#3ba6f1]/15 dark:group-hover:bg-zinc-800/30"
                            style={{ width: `${barPercentage}%` }}
                          />
                          <div className="relative flex items-center gap-2 truncate font-mono text-xs sm:text-sm text-[#0c0a09] dark:text-zinc-200">
                            <DocumentTextIcon className="w-4 h-4 text-[#78716c] dark:text-zinc-400 shrink-0" />
                            <span className="truncate hover:text-[#3ba6f1] dark:hover:text-white font-medium" title={path}>
                              {path}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 py-3 font-mono text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 tabular-nums">
                          {formatInteger(row.visitors)}
                        </TableCell>
                        <TableCell className="text-right pr-4 py-3 font-mono text-xs sm:text-sm font-semibold text-[#0c0a09] dark:text-zinc-200 tabular-nums">
                          {formatInteger(row.pageViews)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-[#a8a29e] dark:text-zinc-500 font-mono text-xs">
                      No page views recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
