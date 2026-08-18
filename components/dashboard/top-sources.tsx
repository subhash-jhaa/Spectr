"use client";

import { useState } from "react";
import { formatInteger } from "@/components/dashboard/formater";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowRightIcon } from "lucide-react";

export interface TopSourcesProps {
  data?: { source: string; visitors: number; percentage?: number }[];
}

/** Map source labels to emoji/icon + color for visual distinction. */
const SOURCE_META: Record<string, { icon: string; color: string }> = {
  Google:          { icon: "🔍", color: "text-blue-400" },
  Bing:            { icon: "🔎", color: "text-teal-400" },
  DuckDuckGo:     { icon: "🦆", color: "text-orange-400" },
  Yahoo:           { icon: "🟣", color: "text-purple-400" },
  Baidu:           { icon: "🔵", color: "text-blue-500" },
  Yandex:          { icon: "🟡", color: "text-yellow-400" },
  LinkedIn:        { icon: "💼", color: "text-blue-500" },
  Facebook:        { icon: "📘", color: "text-blue-600" },
  Instagram:       { icon: "📷", color: "text-pink-400" },
  "X (Twitter)":   { icon: "𝕏",  color: "text-zinc-100" },
  YouTube:         { icon: "▶️", color: "text-red-500" },
  Reddit:          { icon: "🟠", color: "text-orange-500" },
  GitHub:          { icon: "🐙", color: "text-zinc-300" },
  Pinterest:       { icon: "📌", color: "text-red-400" },
  TikTok:          { icon: "🎵", color: "text-pink-500" },
  WhatsApp:        { icon: "💬", color: "text-green-400" },
  Telegram:        { icon: "✈️", color: "text-sky-400" },
  "Product Hunt":  { icon: "🚀", color: "text-orange-400" },
  Medium:          { icon: "📝", color: "text-zinc-300" },
  "Stack Overflow":{ icon: "📚", color: "text-orange-500" },
  Direct:          { icon: "🔗", color: "text-zinc-400" },
};

function getSourceMeta(source: string) {
  return SOURCE_META[source] ?? { icon: "🌐", color: "text-zinc-400" };
}

export function TopSources({ data = [] }: TopSourcesProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? data : data.slice(0, 5);

  return (
    <Card className="relative dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-balance">Traffic Sources</CardTitle>
        <CardDescription className="text-pretty">
          Where your visitors are coming from in the last 7&nbsp;days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
          <Table className="border-t">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6" scope="col">Source</TableHead>
                <TableHead className="pr-6 text-end tabular-nums" scope="col">Visitors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.length > 0 ? (
                displayRows.map((row) => {
                  const meta = getSourceMeta(row.source);
                  return (
                    <TableRow className="hover:bg-transparent" key={row.source}>
                      <TableCell className="max-w-[220px] truncate pl-6 font-medium">
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span>{meta.icon}</span>
                          <span className={meta.color}>{row.source}</span>
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-end text-muted-foreground text-xs tabular-nums">
                        {formatInteger(row.visitors)}
                        {row.percentage !== undefined && (
                          <span className="ml-1.5 text-muted-foreground/60">
                            ({row.percentage.toFixed(1)}%)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground font-mono text-xs">
                    No sources yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {data.length > 5 && (
        <div className="flex items-center justify-center py-2 border-t">
          <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : `View All (${data.length})`}
            <ArrowRightIcon className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  );
}
