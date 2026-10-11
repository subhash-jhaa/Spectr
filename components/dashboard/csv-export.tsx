'use client'
import { useEffect, useRef, useState } from 'react'
import { CSV_REPORTS, type CsvReport } from '@/lib/csv-export'
import type { HistoryDays } from '@/lib/history-range'

export function CsvExport({ projectId, days, rangeQuery }: { projectId?: string; days: HistoryDays; rangeQuery?: string }) {
  const [report, setReport] = useState<CsvReport>('daily')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentRequest = useRef<AbortController | null>(null)
  useEffect(() => {
    setError(null); setExporting(false)
    return () => { currentRequest.current?.abort(); currentRequest.current = null }
  }, [projectId, days, rangeQuery])
  async function download() {
    if (!projectId || currentRequest.current) return
    const controller = new AbortController()
    currentRequest.current = controller
    setExporting(true); setError(null)
    const timeout = setTimeout(() => controller.abort(), 30000)
    try {
      const response = await fetch(`/api/stats/project/${encodeURIComponent(projectId)}/export?${rangeQuery || `days=${days}`}&report=${report}`, { signal: controller.signal, cache: 'no-store' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Unable to export report. Please retry.')
      }
      if (!response.headers.get('Content-Type')?.startsWith('text/csv')) throw new Error('Unexpected export response. Please sign in and retry.')
      const blob = await response.blob()
      if (controller.signal.aborted) return
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || `spectr-${report}-${days}days.csv`
      document.body.appendChild(anchor); anchor.click(); anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (cause) {
      if (currentRequest.current === controller) setError(controller.signal.aborted ? 'Export timed out. Please retry.' : cause instanceof Error ? cause.message : 'Export failed.')
    } finally {
      clearTimeout(timeout)
      if (currentRequest.current === controller) { currentRequest.current = null; setExporting(false) }
    }
  }
  return <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <select aria-label="CSV report" value={report} disabled={exporting} onChange={event => { setReport(event.target.value as CsvReport); setError(null) }} className="rounded-xl border border-[#e8e6e5] bg-white px-3 py-2 text-sm text-[#0c0a09] dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
        {Object.entries(CSV_REPORTS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
      </select>
      <button type="button" disabled={!projectId || exporting} onClick={() => void download()} title="Download the selected report for this project and date range. Top reports use the dashboard’s limits." className="rounded-xl bg-[#3ba6f1] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{exporting ? 'Exporting…' : 'Export CSV'}</button>
    </div>
    {error && <p role="alert" className="max-w-sm text-xs text-rose-600 dark:text-rose-400">{error}</p>}
  </div>
}
