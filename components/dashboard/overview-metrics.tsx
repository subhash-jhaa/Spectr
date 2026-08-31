'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Delta, DeltaIcon, DeltaValue } from '@/components/dashboard/delta';
import { formatInteger } from '@/components/dashboard/formater';
import { OverviewMetrics as OverviewMetricsType } from '@/interfaces/database';

export type OverviewMetricKey = 'visitors' | 'pageViews' | 'bounceRate';

export interface OverviewMetricsProps {
  data?: OverviewMetricsType;
  loading?: boolean;
  activeMetric?: OverviewMetricKey;
  onSelectMetric?: (metric: OverviewMetricKey) => void;
}

export function OverviewMetrics({ 
  data, 
  loading,
  activeMetric = 'visitors',
  onSelectMetric
}: OverviewMetricsProps) {
  if (loading || !data) {
    return (
      <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 rounded-2xl p-5 backdrop-blur-md shadow-sm animate-pulse"
          >
            <div className="h-3.5 w-24 bg-[#f5f5f4] dark:bg-zinc-900 rounded mb-3" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-20 bg-[#f5f5f4] dark:bg-zinc-900 rounded-lg" />
              <div className="h-6 w-16 bg-[#f5f5f4] dark:bg-zinc-900 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const { visitors, pageViews, bounceRate } = data;

  const isInteractive = Boolean(onSelectMetric);

  return (
    <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1">
      {/* ── 1. Unique Visitors ── */}
      <div
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={() => onSelectMetric?.('visitors')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('visitors');
          }
        }}
        className={`group relative rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all duration-200 shadow-sm flex flex-col justify-between text-left outline-none ${
          isInteractive ? 'cursor-pointer' : ''
        } ${
          activeMetric === 'visitors'
            ? 'bg-white dark:bg-zinc-950/90 border-2 border-[#3ba6f1] ring-4 ring-[#3ba6f1]/15 shadow-[0_4px_24px_rgba(59,166,241,0.15)]'
            : 'bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 hover:border-[#3ba6f1]/50 hover:bg-[#fafaf9] dark:hover:bg-zinc-900/40'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716c] dark:text-zinc-400 uppercase tracking-wider group-hover:text-[#0c0a09] dark:group-hover:text-white transition-colors">
              Visitors
            </span>
            {activeMetric === 'visitors' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3ba6f1] uppercase tracking-wider bg-[#3ba6f1]/10 px-2 py-0.5 rounded-full">
                Active Chart
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
            <span className="font-roobert text-3xl sm:text-4xl font-bold tracking-tight text-[#0c0a09] dark:text-white tabular-nums">
              {formatInteger(visitors.current)}
            </span>
            {visitors.isNew ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium shadow-xs">
                New
              </span>
            ) : (
              <Delta value={visitors.delta} variant="badge">
                <DeltaIcon variant="trend" />
                <DeltaValue suffix="%" />
              </Delta>
            )}
          </div>
        </div>
        <p className="text-[11px] text-[#a8a29e] dark:text-zinc-500 font-sans mt-2.5">
          Unique visitors in the last 7 days
        </p>
      </div>

      {/* ── 2. Total Page Views ── */}
      <div
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={() => onSelectMetric?.('pageViews')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('pageViews');
          }
        }}
        className={`group relative rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all duration-200 shadow-sm flex flex-col justify-between text-left outline-none ${
          isInteractive ? 'cursor-pointer' : ''
        } ${
          activeMetric === 'pageViews'
            ? 'bg-white dark:bg-zinc-950/90 border-2 border-[#3ba6f1] ring-4 ring-[#3ba6f1]/15 shadow-[0_4px_24px_rgba(59,166,241,0.15)]'
            : 'bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 hover:border-[#3ba6f1]/50 hover:bg-[#fafaf9] dark:hover:bg-zinc-900/40'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716c] dark:text-zinc-400 uppercase tracking-wider group-hover:text-[#0c0a09] dark:group-hover:text-white transition-colors">
              Page Views
            </span>
            {activeMetric === 'pageViews' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3ba6f1] uppercase tracking-wider bg-[#3ba6f1]/10 px-2 py-0.5 rounded-full">
                Active Chart
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
            <span className="font-roobert text-3xl sm:text-4xl font-bold tracking-tight text-[#0c0a09] dark:text-white tabular-nums">
              {formatInteger(pageViews.current)}
            </span>
            {pageViews.isNew ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium shadow-xs">
                New
              </span>
            ) : (
              <Delta value={pageViews.delta} variant="badge">
                <DeltaIcon variant="trend" />
                <DeltaValue suffix="%" />
              </Delta>
            )}
          </div>
        </div>
        <p className="text-[11px] text-[#a8a29e] dark:text-zinc-500 font-sans mt-2.5">
          Total page interactions tracked
        </p>
      </div>

      {/* ── 3. Bounce Rate ── */}
      <div
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={() => onSelectMetric?.('bounceRate')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('bounceRate');
          }
        }}
        className={`group relative rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all duration-200 shadow-sm flex flex-col justify-between text-left outline-none ${
          isInteractive ? 'cursor-pointer' : ''
        } ${
          activeMetric === 'bounceRate'
            ? 'bg-white dark:bg-zinc-950/90 border-2 border-[#3ba6f1] ring-4 ring-[#3ba6f1]/15 shadow-[0_4px_24px_rgba(59,166,241,0.15)]'
            : 'bg-white dark:bg-zinc-950/70 border border-[#e8e6e5] dark:border-zinc-900/80 hover:border-[#3ba6f1]/50 hover:bg-[#fafaf9] dark:hover:bg-zinc-900/40'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#78716c] dark:text-zinc-400 uppercase tracking-wider group-hover:text-[#0c0a09] dark:group-hover:text-white transition-colors">
              Bounce Rate
            </span>
            {activeMetric === 'bounceRate' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3ba6f1] uppercase tracking-wider bg-[#3ba6f1]/10 px-2 py-0.5 rounded-full">
                Active Chart
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
            <span className="font-roobert text-3xl sm:text-4xl font-bold tracking-tight text-[#0c0a09] dark:text-white tabular-nums">
              {bounceRate.current}%
            </span>
            {bounceRate.isNew ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-xs font-mono font-medium shadow-xs">
                New
              </span>
            ) : (
              <Delta value={bounceRate.delta} variant="badge" isInverse={true}>
                <DeltaIcon variant="trend" />
                <DeltaValue suffix="%" />
              </Delta>
            )}
          </div>
        </div>
        <p className="text-[11px] text-[#a8a29e] dark:text-zinc-500 font-sans mt-2.5">
          Single-page sessions ratio
        </p>
      </div>
    </div>
  );
}
