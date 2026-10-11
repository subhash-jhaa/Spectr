'use client'
import { useState } from 'react'
import { HISTORY_DAYS, parseHistorySelection, resolveHistory, type CustomRange, type HistoryDays } from '@/lib/history-range'
export function DateControls({ days, customRange, compare, onPreset, onCustom, onCompare }: {
  days: HistoryDays; customRange: CustomRange | null; compare: boolean; onPreset: (days: HistoryDays) => void; onCustom: (range: CustomRange) => void; onCompare: (value: boolean) => void
}) {
  const [custom, setCustom] = useState(false)
  const [start, setStart] = useState(customRange?.start || '')
  const [end, setEnd] = useState(customRange?.end || new Date().toISOString().slice(0, 10))
  const [error, setError] = useState<string | null>(null)
  const current = resolveHistory(customRange ? parseHistorySelection(new URLSearchParams(customRange)) || days : days)
  const priorStart = new Date(current.startDate.getTime() - current.days * 86400000).toISOString().slice(0, 10)
  const priorEnd = new Date(current.startDate.getTime() - 1).toISOString().slice(0, 10)
  const inputClass = 'rounded-xl border border-[#e8e6e5] bg-white px-3 py-2 text-sm text-[#0c0a09] dark:border-zinc-800 dark:bg-zinc-950 dark:text-white'
  return <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-[#78716c] dark:text-zinc-400">Date range
        <select aria-label="Analytics date range" className={inputClass} value={custom || customRange ? 'custom' : days} onChange={event => {
          if (event.target.value === 'custom') setCustom(true)
          else { setCustom(false); setError(null); onPreset(Number(event.target.value) as HistoryDays) }
        }}>
          {HISTORY_DAYS.map(value => <option key={value} value={value}>Last {value} days</option>)}
          <option value="custom">Custom dates</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-[#78716c] dark:text-zinc-400"><input type="checkbox" checked={compare} onChange={event => onCompare(event.target.checked)} />Compare with previous period</label>
    </div>
    {(custom || customRange) && <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
      event.preventDefault(); const range = parseHistorySelection(new URLSearchParams({ start, end }))
      if (!range) { setError('Choose valid dates, ending today or earlier, spanning at most 366 days.'); return }
      setError(null); onCustom({ start, end })
    }}>
      <label className="text-xs text-[#78716c]">Start (UTC)<input className={`${inputClass} ml-2`} type="date" required min="2000-01-01" max={end} value={start} onChange={event => setStart(event.target.value)} /></label>
      <label className="text-xs text-[#78716c]">End (UTC)<input className={`${inputClass} ml-2`} type="date" required min={start || '2000-01-01'} max={new Date().toISOString().slice(0, 10)} value={end} onChange={event => setEnd(event.target.value)} /></label>
      <button type="submit" className="rounded-xl bg-[#3ba6f1] px-3 py-2 text-sm text-white">Apply dates</button>
      {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
    </form>}
    <p className="text-xs text-[#78716c]">{customRange ? `${customRange.start} to ${customRange.end} (inclusive, UTC)` : `Last ${days} calendar days, UTC; today is still in progress.`}</p>
    {compare && <p className="text-xs text-[#78716c]">Comparing with {priorStart} to {priorEnd} (UTC).</p>}
  </div>
}
