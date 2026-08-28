"use client";

import { useState, useMemo } from "react";
import { formatInteger } from "@/components/dashboard/formater";
import { Button } from "@/components/ui/button";
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
    <Card className="relative md:col-span-2 bg-zinc-950/70 border border-zinc-900/80 rounded-xl backdrop-blur-md hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-zinc-900/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold font-mono tracking-tight text-white">Top Pages</CardTitle>
              <CardDescription className="text-xs font-mono text-zinc-500 mt-0.5">
                Most visited URLs in the last 7 days
              </CardDescription>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/70 border border-zinc-800/60 px-2 py-0.5 rounded">
              {data.length} {data.length === 1 ? "page" : "pages"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
            <Table>
              <TableHeader className="bg-zinc-950/60">
                <TableRow className="border-b border-zinc-900 hover:bg-transparent text-xs text-zinc-500 font-mono">
                  <TableHead className="pl-4 h-8">Path</TableHead>
                  <TableHead className="text-right pr-4 h-8 w-24">Visitors</TableHead>
                  <TableHead className="text-right pr-4 h-8 w-24">Views</TableHead>
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
                        className="group relative border-b border-zinc-900/50 hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="pl-4 py-2.5 relative max-w-[240px]">
                          {/* Background visual proportional bar */}
                          <div
                            className="absolute inset-y-1 left-0 bg-zinc-800/20 rounded pointer-events-none transition-all duration-300 group-hover:bg-zinc-800/30"
                            style={{ width: `${barPercentage}%` }}
                          />
                          <div className="relative flex items-center gap-2 truncate font-mono text-xs text-zinc-200">
                            <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span className="truncate hover:text-white" title={path}>
                              {path}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 py-2.5 font-mono text-xs text-zinc-400 tabular-nums">
                          {formatInteger(row.visitors)}
                        </TableCell>
                        <TableCell className="text-right pr-4 py-2.5 font-mono text-xs font-semibold text-zinc-200 tabular-nums">
                          {formatInteger(row.pageViews)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-zinc-500 font-mono text-xs">
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
