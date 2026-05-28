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

export interface TopReferrersProps {
  data?: { referrer: string; visitors: number }[];
  projectId?: string;
}

export function TopReferrers({ data = [] }: TopReferrersProps) {
  const [expanded, setExpanded] = useState(false);

  const mappedRows = data.map((item) => ({
    host: item.referrer || "Direct",
    sessions: item.visitors,
  }));

  const displayRows = expanded ? mappedRows : mappedRows.slice(0, 5);

  return (
    <Card className="relative dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-balance">Top referrers</CardTitle>
        <CardDescription className="text-pretty">
          External sites sending the most traffic in the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
          <Table className="border-t">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6" scope="col">Host</TableHead>
                <TableHead className="pr-6 text-end tabular-nums" scope="col">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.length > 0 ? (
                displayRows.map((row) => (
                  <TableRow className="hover:bg-transparent" key={row.host}>
                    <TableCell className="max-w-[220px] truncate pl-6 font-medium">
                      <span className="text-xs">{row.host}</span>
                    </TableCell>
                    <TableCell className="pr-6 text-end text-muted-foreground text-xs tabular-nums">
                      {formatInteger(row.sessions)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground font-mono text-xs">
                    No referrers yet.
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
