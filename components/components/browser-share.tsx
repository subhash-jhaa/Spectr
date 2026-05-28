"use client";

import { useState } from "react";
import { Button } from "@/components/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/components/ui/card";
import {
  ShareBarList, ShareBarListContent, ShareBarListFill,
  ShareBarListItem, ShareBarListLabel, ShareBarListValue,
} from "@/components/components/share-bar-list";
import { ArrowRightIcon } from "lucide-react";

export interface BrowserShareProps {
  data?: { browser: string; visitors: number; share: number }[];
  projectId?: string;
}

export function BrowserShare({ data = [] }: BrowserShareProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? data : data.slice(0, 5);

  return (
    <Card className="dark:bg-transparent">
      <CardHeader className="border-b">
        <CardTitle className="text-balance">Browsers</CardTitle>
        <CardDescription className="text-pretty">
          Share of sessions by browser family in the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 py-1">
        {displayRows.length > 0 ? (
          <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
            <ShareBarList aria-label="Sessions by browser">
              {displayRows.map((row) => (
                <ShareBarListItem key={row.browser} value={row.share}>
                  <ShareBarListContent>
                    <ShareBarListLabel>{row.browser}</ShareBarListLabel>
                    <ShareBarListValue>{row.share}%</ShareBarListValue>
                  </ShareBarListContent>
                  <ShareBarListFill />
                </ShareBarListItem>
              ))}
            </ShareBarList>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground font-mono text-xs">
            No browser data yet.
          </div>
        )}
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
