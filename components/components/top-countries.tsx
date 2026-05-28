"use client";

import { useState } from "react";
import NextImage from "next/image";
import { formatInteger } from "@/components/components/formater";
import { Button } from "@/components/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/components/ui/table";
import { ArrowRightIcon } from "lucide-react";

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
  };
  return map[name.toLowerCase()] || "US";
};

export function TopCountries({ data = [] }: TopCountriesProps) {
  const [expanded, setExpanded] = useState(false);

  const mappedRows = data.map((item) => {
    const code = getCountryCode(item.country);
    return {
      code,
      name: item.country.length === 2 ? (regionNames.of(code) || code) : item.country,
      visits: item.visitors,
    };
  });

  const displayRows = expanded ? mappedRows : mappedRows.slice(0, 5);

  return (
    <Card className="relative md:col-span-2 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-balance">Top countries</CardTitle>
        <CardDescription className="text-pretty">
          Top countries in the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
          <Table className="border-t">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6" scope="col">Country</TableHead>
                <TableHead className="text-end tabular-nums" scope="col">Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.length > 0 ? (
                displayRows.map((row) => (
                  <TableRow className="hover:bg-transparent" key={row.code}>
                    <TableCell className="max-w-[220px] truncate pl-6 font-medium">
                      <span className="inline-flex max-w-full items-center gap-2">
                        <NextImage
                          alt={`Flag of ${row.code}`}
                          className="h-3.5 w-5 shrink-0 rounded object-cover"
                          height={14}
                          src={flagUrl(row.code)}
                          width={20}
                          unoptimized
                        />
                        <span className="min-w-0 truncate text-xs">{row.name}</span>
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-end text-muted-foreground text-xs tabular-nums">
                      {formatInteger(row.visits)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground font-mono text-xs">
                    No country data yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {mappedRows.length > 5 && (
        <div className="flex items-center justify-center py-2 border-t">
          <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : `View All (${mappedRows.length})`}
            <ArrowRightIcon className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  );
}
