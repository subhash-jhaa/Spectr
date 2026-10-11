'use client'
import { useCallback, useEffect, useState } from 'react'
export function TrafficFilters({ projectId }: { projectId: string }) {
  const [filterBots, setFilterBots] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [website, setWebsite] = useState('')
  const [links, setLinks] = useState<{ exclude: string; include: string } | null>(null)
  const endpoint = `/api/stats/project/${encodeURIComponent(projectId)}/filters`
  const load = useCallback(async (signal: AbortSignal) => {
    try { const response = await fetch(endpoint, { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]), cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load traffic filters')
      const data = await response.json(); if (!signal.aborted) { setFilterBots(data.filterBots); setError(null) }
    } catch (cause) { if (!signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load filters') }
  }, [endpoint])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])
  async function toggle() {
    if (filterBots === null) return
    setBusy(true); setError(null)
    try { const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filterBots: !filterBots }), signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Unable to update bot filtering')
      const data = await response.json(); setFilterBots(data.filterBots)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to update filters') }
    finally { setBusy(false) }
  }
  return <section className="rounded-2xl border border-[#e8e6e5] bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950/70">
    <h3 className="text-base font-semibold dark:text-white">Traffic filters</h3>
    <label className="mt-4 flex items-center gap-3 text-sm dark:text-zinc-300"><input type="checkbox" disabled={filterBots === null || busy} checked={filterBots === true} onChange={() => void toggle()} />Exclude known bots <span className="text-xs text-[#78716c]">{filterBots === null ? 'Checking…' : filterBots ? 'Active' : 'Off'}</span></label>
    <p className="mt-2 text-xs text-[#78716c]">Applies to new pageviews, custom events, and Web Vitals. Identifies recognized bots by user agent; existing analytics are preserved.</p>
    {error && <p role="alert" className="mt-2 text-sm text-rose-600">{error} <button className="underline" onClick={() => void load(new AbortController().signal)}>Retry</button></p>}
    <h4 className="mt-5 text-sm font-semibold dark:text-white">Exclude your own browser</h4>
    <p className="mt-2 text-xs text-[#78716c]">Open the exclusion link on your website in each browser you want to exclude. The website confirms the active setting. It is stored locally per website and project; clearing browser storage removes it.</p>
    <form className="mt-3 flex flex-wrap gap-2" onSubmit={event => {
      event.preventDefault(); try { const url = new URL(website); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error()
        url.searchParams.delete('spectr_include'); url.searchParams.delete('spectr_exclude'); url.searchParams.delete('spectr_test')
        url.searchParams.set('spectr_exclude', projectId); const exclude = url.toString()
        url.searchParams.delete('spectr_exclude'); url.searchParams.set('spectr_include', projectId); setLinks({ exclude, include: url.toString() }); setError(null)
      } catch { setError('Enter a valid HTTP or HTTPS website URL without credentials') }
    }}>
      <input aria-label="Website URL for browser exclusion" type="url" required maxLength={2000} placeholder="https://your-website.com" value={website} onChange={event => { setWebsite(event.target.value); setLinks(null) }} className="flex-1 rounded-xl border border-[#e8e6e5] bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:text-white" />
      <button className="rounded-xl bg-[#3ba6f1] px-3 py-2 text-sm text-white">Prepare browser links</button>
    </form>
    {links && <div className="mt-3 flex gap-4 text-sm text-[#3ba6f1]"><a href={links.exclude} target="_blank" rel="noopener noreferrer" className="underline">Exclude this browser ↗</a><a href={links.include} target="_blank" rel="noopener noreferrer" className="underline">Enable tracking again ↗</a></div>}
  </section>
}
