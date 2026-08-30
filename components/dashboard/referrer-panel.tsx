"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { formatInteger } from "@/components/dashboard/formater";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export type AttributionTab =
  | "refs"
  | "urls"
  | "types"
  | "source"
  | "medium"
  | "campaign"
  | "term"
  | "content";

interface BreakdownItem {
  name: string;
  views: number;
  sessions: number;
}

export interface ReferrerPanelProps {
  projectId?: string;
  initialData?: BreakdownItem[];
}

const TABS: { key: AttributionTab; label: string; placeholder: string }[] = [
  { key: "refs", label: "Refs", placeholder: "Search refs..." },
  { key: "urls", label: "Urls", placeholder: "Search urls..." },
  { key: "types", label: "Types", placeholder: "Search types..." },
  { key: "source", label: "Source", placeholder: "Search sources..." },
  { key: "medium", label: "Medium", placeholder: "Search medium..." },
  { key: "campaign", label: "Campaign", placeholder: "Search campaigns..." },
  { key: "term", label: "Term", placeholder: "Search terms..." },
  { key: "content", label: "Content", placeholder: "Search content..." },
];

const SOURCE_ICONS: Record<string, { icon: string; color: string }> = {
  // AI
  ChatGPT:          { icon: "🤖", color: "text-emerald-400" },
  Claude:           { icon: "🧠", color: "text-amber-400" },
  Perplexity:       { icon: "🔮", color: "text-teal-300" },
  Copilot:          { icon: "💻", color: "text-blue-400" },
  Gemini:           { icon: "♊", color: "text-blue-300" },
  "You.com":        { icon: "⚡", color: "text-indigo-400" },
  Phind:            { icon: "🔎", color: "text-sky-300" },

  // Search
  Google:           { icon: "🔍", color: "text-blue-400" },
  Bing:             { icon: "🔎", color: "text-teal-400" },
  DuckDuckGo:      { icon: "🦆", color: "text-orange-400" },
  "Brave Search":   { icon: "🦁", color: "text-orange-500" },
  Ecosia:           { icon: "🌳", color: "text-emerald-500" },
  Kagi:             { icon: "🐕", color: "text-yellow-400" },
  Yahoo:            { icon: "🟣", color: "text-purple-400" },
  Baidu:            { icon: "🔵", color: "text-blue-500" },
  Yandex:           { icon: "🟡", color: "text-yellow-400" },

  // Social
  LinkedIn:         { icon: "💼", color: "text-blue-500" },
  Facebook:         { icon: "📘", color: "text-blue-600" },
  Instagram:        { icon: "📷", color: "text-pink-400" },
  "X (Twitter)":    { icon: "𝕏",  color: "text-zinc-100" },
  Twitter:          { icon: "𝕏",  color: "text-zinc-100" },
  Threads:          { icon: "🧵", color: "text-zinc-100" },
  Bluesky:          { icon: "🦋", color: "text-sky-400" },
  Mastodon:         { icon: "🐘", color: "text-violet-400" },
  YouTube:          { icon: "▶️", color: "text-red-500" },
  Reddit:           { icon: "🟠", color: "text-orange-500" },
  TikTok:           { icon: "🎵", color: "text-pink-500" },
  Pinterest:        { icon: "📌", color: "text-red-400" },
  Discord:          { icon: "👾", color: "text-indigo-400" },
  Slack:            { icon: "💬", color: "text-emerald-400" },
  WhatsApp:         { icon: "📱", color: "text-green-400" },
  Telegram:         { icon: "✈️", color: "text-sky-400" },

  // Tech / Dev
  "Hacker News":    { icon: "🟧", color: "text-orange-500" },
  GitHub:           { icon: "🐙", color: "text-zinc-300" },
  GitLab:           { icon: "🦊", color: "text-orange-400" },
  "Stack Overflow": { icon: "📚", color: "text-orange-500" },
  "Product Hunt":   { icon: "🚀", color: "text-orange-400" },
  Medium:           { icon: "📝", color: "text-zinc-300" },
  Substack:         { icon: "💌", color: "text-orange-400" },
  "Dev.to":         { icon: "👩‍💻", color: "text-zinc-200" },

  // Channel types
  "Organic Search": { icon: "🔍", color: "text-blue-400" },
  "AI Search":      { icon: "🤖", color: "text-emerald-400" },
  Social:           { icon: "💬", color: "text-pink-400" },
  "Paid Search":    { icon: "💰", color: "text-amber-400" },
  "Paid Social":    { icon: "📣", color: "text-purple-400" },
  Email:            { icon: "✉️", color: "text-sky-400" },
  Referral:         { icon: "🔗", color: "text-zinc-300" },
  Direct:           { icon: "🌐", color: "text-zinc-400" },
  "Direct / None":  { icon: "⛶", color: "text-zinc-500" },
  "Direct / Not set": { icon: "⛶", color: "text-zinc-500" },
};

function getItemIcon(name: string) {
  if (name.toLowerCase().includes("direct") || name.toLowerCase().includes("not set") || name.toLowerCase().includes("none")) {
    return { icon: "⛶", color: "text-zinc-500" };
  }
  for (const [key, val] of Object.entries(SOURCE_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return { icon: "🌐", color: "text-zinc-400" };
}

export function ReferrerPanel({ projectId, initialData = [] }: ReferrerPanelProps) {
  const [activeTab, setActiveTab] = useState<AttributionTab>("refs");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<BreakdownItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchBreakdown = useCallback(async (tab: AttributionTab) => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats/project/${projectId}/referrer-breakdown?dimension=${tab}&days=7`);
      if (res.ok) {
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error || "Failed to load attribution data");
      }
    } catch (err) {
      console.error("Failed to fetch referrer breakdown:", err);
      setError("Network error fetching attribution data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBreakdown(activeTab);
  }, [activeTab, fetchBreakdown]);

  const activeTabConfig = useMemo(() => {
    return TABS.find((t) => t.key === activeTab) || TABS[0];
  }, [activeTab]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => item.name.toLowerCase().includes(q));
  }, [data, searchQuery]);

  const maxViews = useMemo(() => {
    return filteredData.reduce((max, item) => Math.max(max, item.views), 0) || 1;
  }, [filteredData]);

  const displayRows = expanded ? filteredData : filteredData.slice(0, 10);

  return (
    <Card className="col-span-1 md:col-span-2 bg-zinc-950/70 border border-zinc-900/80 rounded-xl backdrop-blur-md hover:border-zinc-800/80 transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        {/* Top Tab Bar */}
        <div className="border-b border-zinc-900/80 px-4 pt-3 pb-2.5 bg-zinc-950/40">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearchQuery("");
                    setExpanded(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input & Controls */}
        <div className="px-4 py-2.5 border-b border-zinc-900/80 flex items-center justify-between gap-3 bg-zinc-950/60">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTabConfig.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/70 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
            />
          </div>
          <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/70 border border-zinc-800/60 px-2 py-0.5 rounded">
            {filteredData.length} {filteredData.length === 1 ? "entry" : "entries"}
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className={expanded ? "max-h-96 overflow-y-auto" : ""}>
            <Table>
              <TableHeader className="bg-zinc-950/60">
                <TableRow className="border-b border-zinc-900 hover:bg-transparent text-xs text-zinc-500 font-mono">
                  <TableHead className="pl-4 h-8">Attribution channel</TableHead>
                  <TableHead className="text-right pr-4 h-8 w-24">Visitors</TableHead>
                  <TableHead className="text-right pr-4 h-8 w-24">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-zinc-900/50">
                      <TableCell className="pl-4 py-2.5">
                        <div className="h-4 bg-zinc-900 rounded animate-pulse w-48"></div>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2.5">
                        <div className="h-4 bg-zinc-900 rounded animate-pulse w-12 ml-auto"></div>
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2.5">
                        <div className="h-4 bg-zinc-900 rounded animate-pulse w-10 ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : displayRows.length > 0 ? (
                  displayRows.map((row, idx) => {
                    const meta = getItemIcon(row.name);
                    const barPercentage = Math.max(3, (row.views / maxViews) * 100);

                    return (
                      <TableRow
                        key={row.name + idx}
                        className="group relative border-b border-zinc-900/50 hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="pl-4 py-2.5 relative max-w-[320px]">
                          {/* Background visual proportional bar */}
                          <div
                            className="absolute inset-y-1 left-0 bg-zinc-800/20 rounded pointer-events-none transition-all duration-300 group-hover:bg-zinc-800/30"
                            style={{ width: `${barPercentage}%` }}
                          />
                          <div className="relative flex items-center gap-2 truncate font-mono text-xs text-zinc-200">
                            <span className="shrink-0 text-sm">{meta.icon}</span>
                            <span
                              title={row.name}
                              className={`truncate ${
                                row.name.includes("Direct / Not set")
                                  ? "text-zinc-500 italic"
                                  : "text-zinc-200 group-hover:text-white"
                              }`}
                            >
                              {row.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="relative pr-4 py-2.5 text-right font-mono text-xs text-zinc-400 tabular-nums">
                          {formatInteger(row.sessions)}
                        </TableCell>

                        <TableCell className="relative pr-4 py-2.5 text-right font-mono text-xs font-semibold text-zinc-200 tabular-nums">
                          {formatInteger(row.views)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 font-mono text-xs">
                      <div className="text-red-400 mb-2">{error}</div>
                      <button
                        onClick={() => fetchBreakdown(activeTab)}
                        className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded text-xs transition cursor-pointer"
                      >
                        Retry
                      </button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-zinc-500 font-mono text-xs">
                      No data recorded for {activeTabConfig.label.toLowerCase()} in the selected period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>

      {/* Footer Expand / Collapse */}
      {filteredData.length > 10 && (
        <div className="flex items-center justify-center py-2 px-4 border-t border-zinc-900/80 bg-zinc-950/40">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            <span>{expanded ? "Show less" : `View all (${filteredData.length})`}</span>
            <ChevronDownIcon
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </Card>
  );
}
