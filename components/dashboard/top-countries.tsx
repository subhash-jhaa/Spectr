"use client";

import { useState, useMemo } from "react";
import NextImage from "next/image";
import { formatInteger } from "@/components/dashboard/formater";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { getCountryCode, getCountryName } from "@/lib/geo-utils";

const FLAGPACK_BASE = "https://flag.vercel.app";

function flagUrl(countryCode: string) {
  const code = countryCode && countryCode.length === 2 && countryCode !== 'UN' ? countryCode.toUpperCase() : 'US';
  return `${FLAGPACK_BASE}/s/${code}.svg`;
}

export interface TopCountriesProps {
  data?: { country: string; visitors: number }[];
  projectId?: string;
}

export function TopCountries({ data = [] }: TopCountriesProps) {
  const [expanded, setExpanded] = useState(false);

  const mappedRows = useMemo(() => {
    return data.map((item) => {
      const code = getCountryCode(item.country);
      const name = getCountryName(item.country);
      return {
        code,
        name: name !== 'Unknown' ? name : (item.country || 'Unknown'),
        visits: item.visitors,
      };
    });
  }, [data]);

  const maxVisits = useMemo(() => {
    return mappedRows.reduce((max, item) => Math.max(max, item.visits), 0) || 1;
  }, [mappedRows]);

  const displayRows = expanded ? mappedRows : mappedRows.slice(0, 5);

  return (
    <Card className="relative md:col-span-2 bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl backdrop-blur-md hover:border-[#3ba6f1]/40 dark:hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3.5 border-b border-[#e8e6e5] dark:border-zinc-900/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold font-roobert tracking-tight text-[#0c0a09] dark:text-white">Top Countries</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 mt-0.5">
                Visitor distribution by geography
              </CardDescription>
            </div>
            <div className="text-xs font-mono font-medium text-[#78716c] dark:text-zinc-400 bg-[#f5f5f4] dark:bg-zinc-900/70 border border-[#e8e6e5] dark:border-zinc-800/60 px-2.5 py-0.5 rounded-lg">
              {mappedRows.length} {mappedRows.length === 1 ? "country" : "countries"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
            <Table>
              <TableHeader className="bg-[#fafaf9] dark:bg-zinc-950/60">
                <TableRow className="border-b border-[#e8e6e5] dark:border-zinc-900 hover:bg-transparent text-xs sm:text-sm text-[#78716c] dark:text-zinc-400 font-medium">
                  <TableHead className="pl-4 h-9 text-[#78716c] dark:text-zinc-400 font-semibold">Country</TableHead>
                  <TableHead className="text-right pr-4 h-9 w-28 text-[#78716c] dark:text-zinc-400 font-semibold">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.length > 0 ? (
                  displayRows.map((row, idx) => {
                    const barPercentage = Math.max(2, (row.visits / maxVisits) * 100);

                    return (
                      <TableRow
                        key={row.code + idx}
                        className="group relative border-b border-[#e8e6e5]/60 dark:border-zinc-900/50 hover:bg-[#f5f5f4] dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="pl-4 py-3 relative max-w-[260px]">
                          {/* Background visual proportional bar */}
                          <div
                            className="absolute inset-y-1 left-0 bg-[#3ba6f1]/10 dark:bg-zinc-800/20 rounded pointer-events-none transition-all duration-300 group-hover:bg-[#3ba6f1]/15 dark:group-hover:bg-zinc-800/30"
                            style={{ width: `${barPercentage}%` }}
                          />
                          <div className="relative flex items-center gap-2.5 truncate text-xs sm:text-sm text-[#0c0a09] dark:text-zinc-200">
                            <NextImage
                              alt={`Flag of ${row.code}`}
                              className="h-3.5 w-5 shrink-0 rounded object-cover border border-[#e8e6e5] dark:border-zinc-800"
                              height={14}
                              src={flagUrl(row.code)}
                              width={20}
                              unoptimized
                            />
                            <span className="truncate hover:text-[#3ba6f1] dark:hover:text-white font-medium" title={row.name}>
                              {row.name}
                            </span>
                            <span className="text-xs text-[#78716c] dark:text-zinc-400 font-mono">
                              ({row.code})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 py-3 font-mono text-xs sm:text-sm font-semibold text-[#0c0a09] dark:text-zinc-200 tabular-nums">
                          {formatInteger(row.visits)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10 text-[#a8a29e] dark:text-zinc-500 font-mono text-xs">
                      No country telemetry recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>

      {mappedRows.length > 5 && (
        <div className="flex items-center justify-center py-2 px-4 border-t border-[#e8e6e5] dark:border-zinc-900/80 bg-[#fafaf9] dark:bg-zinc-950/40">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#78716c] dark:text-zinc-400 hover:text-[#0c0a09] dark:hover:text-white transition-colors cursor-pointer py-1"
          >
            <span>{expanded ? "Show less" : `View all (${mappedRows.length})`}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </Card>
  );
}
