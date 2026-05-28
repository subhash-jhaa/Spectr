"use client";

import { useState } from "react";
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

export interface TopPagesProps {
  data?: { pageUrl: string; visitors: number; pageViews: number }[];
  projectId?: string;
}

const getPagePath = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url || "/";
  }
};

export function TopPages({ data = [] }: TopPagesProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? data : data.slice(0, 5);

  return (
    <Card className="relative md:col-span-2 dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-balance">Top pages</CardTitle>
        <CardDescription className="text-pretty">
          Most visited pages in the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
          <Table className="border-t">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6" scope="col">Path</TableHead>
                <TableHead className="text-end tabular-nums" scope="col">Visitors</TableHead>
                <TableHead className="pr-6 text-end tabular-nums" scope="col">Page Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.length > 0 ? (
                displayRows.map((row) => (
                  <TableRow className="hover:bg-transparent" key={row.pageUrl}>
                    <TableCell className="max-w-[200px] truncate pl-6 font-medium">
                      <span className="w-max rounded border border-border bg-muted/50 px-1 py-px text-xs">
                        {getPagePath(row.pageUrl)}
                      </span>
                    </TableCell>
                    <TableCell className="text-end text-muted-foreground text-xs tabular-nums">
                      {formatInteger(row.visitors)}
                    </TableCell>
                    <TableCell className="pr-6 text-end text-muted-foreground text-xs tabular-nums">
                      {formatInteger(row.pageViews)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground font-mono text-xs">
                    No page data yet.
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
