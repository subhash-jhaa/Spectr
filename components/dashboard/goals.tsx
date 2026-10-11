'use client'
import { useCallback, useEffect, useState } from 'react'
import type { GoalResult } from '@/queries/goals'
export function Goals({ projectId, rangeQuery }: { projectId: string; rangeQuery: string }) {
  const [goals, setGoals] = useState<GoalResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  const endpoint = `/api/stats/project/${encodeURIComponent(projectId)}/goals`
  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true); setGoals([]); setError(null)
    try { const response = await fetch(`${endpoint}?${rangeQuery}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]), cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load conversion goals')
      const data = await response.json(); if (!signal.aborted) setGoals(data)
    } catch (cause) { if (!signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load goals') }
    finally { if (!signal.aborted) setLoading(false) }
  }, [endpoint, rangeQuery])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load, revision])
  async function change(method: 'POST' | 'DELETE', id?: string) {
    setBusy(true); setError(null)
    try { const response = await fetch(`${endpoint}${id ? `?goalId=${encodeURIComponent(id)}` : ''}`, { method,
      ...(method === 'POST' ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, eventName }) } : {}), signal: AbortSignal.timeout(10000) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to update goal')
      if (method === 'POST') { setName(''); setEventName('') } setRevision(value => value + 1)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to update goal') }
    finally { setBusy(false) }
  }
  return <section className="mt-4 rounded-2xl border border-[#e8e6e5] bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950/70">
    <h3 className="text-base font-semibold dark:text-white">Events & conversion goals</h3>
    <p className="mt-2 text-sm text-[#78716c]">Track successful actions after your tracking script loads: <code className="break-all">window.spectr?.track(&quot;signup_completed&quot;)</code></p>
    <p className="mt-2 text-xs text-[#78716c]">Conversion rate = sessions with at least one matching event ÷ all tracked sessions in the selected UTC period. Sources use each session’s first pageview in that period. Repeated actions increase event totals, not converted-session totals.</p>
    <form className="mt-4 flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); void change('POST') }}>
      <input aria-label="Goal name" required maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Newsletter signup" className="rounded-xl border bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:text-white" />
      <input aria-label="Goal event name" required pattern="[a-zA-Z][a-zA-Z0-9_.:\-]{0,63}" maxLength={64} value={eventName} onChange={event => setEventName(event.target.value)} placeholder="signup_completed" className="rounded-xl border bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:text-white" />
      <button disabled={busy} className="rounded-xl bg-[#3ba6f1] px-3 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Saving…' : 'Add goal'}</button>
    </form>
    {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error} <button className="underline" onClick={() => setRevision(value => value + 1)}>Retry</button></p>}
    {loading ? <p role="status" className="mt-4 text-sm text-[#78716c]">Loading goals…</p> : !goals.length && !error ? <p className="mt-4 text-sm text-[#78716c]">No goals configured. Add an event name to measure its conversions.</p> : goals.map(goal => <div key={goal.id} className="mt-5 border-t border-[#e8e6e5] pt-4 dark:border-zinc-800">
      <div className="flex justify-between gap-3"><h4 className="font-medium dark:text-white">{goal.name} <span className="text-xs text-[#78716c]">({goal.eventName})</span></h4><button disabled={busy} onClick={() => void change('DELETE', goal.id)} className="text-xs text-rose-600">Remove goal</button></div>
      <p className="mt-2 text-sm dark:text-zinc-300">{goal.conversions} events · {goal.convertedSessions} / {goal.sessions} sessions converted · {goal.conversionRate}% conversion rate</p>
      <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm dark:text-zinc-300"><thead><tr className="text-xs text-[#78716c]"><th className="py-2">Source</th><th>Sessions</th><th>Converted sessions</th><th>Events</th><th>Conversion rate</th></tr></thead><tbody>{goal.sources.map(source => <tr key={source.source}><td className="py-2">{source.source}</td><td>{source.sessions}</td><td>{source.convertedSessions}</td><td>{source.conversions}</td><td>{source.conversionRate}%</td></tr>)}</tbody></table></div>
    </div>)}
  </section>
}
