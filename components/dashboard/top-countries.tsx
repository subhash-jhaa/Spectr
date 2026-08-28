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
import { ChevronDownIcon, GlobeAmericasIcon } from "@heroicons/react/24/outline";

const FLAGPACK_BASE = "https://flag.vercel.app";
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function flagUrl(countryCode: string) {
  return `${FLAGPACK_BASE}/s/${countryCode.toUpperCase()}.svg`;
}

export interface TopCountriesProps {
  data?: { country: string; visitors: number }[];
  projectId?: string;
}

const getCountryCode = (name: string) => {
  if (!name) return "US";
  if (name.length === 2) return name.toUpperCase();
  const map: Record<string, string> = {
    "united states": "US", "united kingdom": "GB", "germany": "DE",
    "france": "FR", "canada": "CA", "netherlands": "NL", "india": "IN",
    "australia": "AU", "brazil": "BR", "japan": "JP", "china": "CN",
  };
  return map[name.toLowerCase()] || "US";
};

export function TopCountries({ data = [] }: TopCountriesProps) {
  const [expanded, setExpanded] = useState(false);

  const mappedRows = useMemo(() => {
    return data.map((item) => {
      const code = getCountryCode(item.country);
      return {
        code,
        name: item.country.length === 2 ? (regionNames.of(code) || code) : item.country,
        visits: item.visitors,
      };
    });
  }, [data]);

  const maxVisits = useMemo(() => {
    return mappedRows.reduce((max, item) => Math.max(max, item.visits), 0) || 1;
  }, [mappedRows]);

  const displayRows = expanded ? mappedRows : mappedRows.slice(0, 5);

  return (
    <Card className="relative md:col-span-2 bg-zinc-950/70 border border-zinc-900/80 rounded-xl backdrop-blur-md hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-zinc-900/80">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold font-mono tracking-tight text-white">Top Countries</CardTitle>
              <CardDescription className="text-xs font-mono text-zinc-500 mt-0.5">
                Visitor distribution by geography
              </CardDescription>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/70 border border-zinc-800/60 px-2 py-0.5 rounded">
              {mappedRows.length} {mappedRows.length === 1 ? "country" : "countries"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
            <Table>
              <TableHeader className="bg-zinc-950/60">
                <TableRow className="border-b border-zinc-900 hover:bg-transparent text-xs text-zinc-500 font-mono">
                  <TableHead className="pl-4 h-8">Country</TableHead>
                  <TableHead className="text-right pr-4 h-8 w-24">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.length > 0 ? (
                  displayRows.map((row, idx) => {
                    const barPercentage = Math.max(2, (row.visits / maxVisits) * 100);

                    return (
                      <TableRow
                        key={row.code + idx}
                        className="group relative border-b border-zinc-900/50 hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="pl-4 py-2.5 relative max-w-[260px]">
                          {/* Background visual proportional bar */}
                          <div
                            className="absolute inset-y-1 left-0 bg-zinc-800/20 rounded pointer-events-none transition-all duration-300 group-hover:bg-zinc-800/30"
                            style={{ width: `${barPercentage}%` }}
                          />
                          <div className="relative flex items-center gap-2.5 truncate font-mono text-xs text-zinc-200">
                            <NextImage
                              alt={`Flag of ${row.code}`}
                              className="h-3 w-4 shrink-0 rounded object-cover border border-zinc-800"
                              height={12}
                              src={flagUrl(row.code)}
                              width={16}
                              unoptimized
                            />
                            <span className="truncate hover:text-white" title={row.name}>
                              {row.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              ({row.code})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 py-2.5 font-mono text-xs font-semibold text-zinc-200 tabular-nums">
                          {formatInteger(row.visits)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10 text-zinc-500 font-mono text-xs">
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
        <div className="flex items-center justify-center py-2 px-4 border-t border-zinc-900/80 bg-zinc-950/40">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            <span>{expanded ? "Show less" : `View all (${mappedRows.length})`}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </Card>
  );
}
