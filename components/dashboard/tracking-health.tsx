'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Health = {
  status: 'waiting' | 'connected' | 'inactive'
  lastReceivedAt: string | null
  trackerVersion: string | null
  latestTrackerVersion: string
  test: { status: 'pending' | 'passed' | 'expired'; receivedAt?: string; version?: string; expiresAt?: number } | null
}
type InstallationTest = { token: string; testUrl: string; expiresAt: number }

export function TrackingHealth({ projectId }: { projectId: string }) {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [test, setTest] = useState<InstallationTest | null>(null)
  const [starting, setStarting] = useState(false)
  const currentRequest = useRef<AbortController | null>(null)
  const testRequest = useRef<AbortController | null>(null)
  const endpoint = `/api/stats/project/${encodeURIComponent(projectId)}/tracking-health`
  const refresh = useCallback(async (replace = false) => {
    // Background polling waits for the previous request, including slow responses.
    if (currentRequest.current && !replace) return;
    currentRequest.current?.abort()
    const controller = new AbortController()
    currentRequest.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch(`${endpoint}${test ? `?testToken=${encodeURIComponent(test.token)}` : ''}`, { signal: controller.signal, cache: 'no-store' })
      if (!response.ok) throw new Error('Tracking health is temporarily unavailable. Try again.')
      const data: Health = await response.json()
      if (!controller.signal.aborted) { setHealth(data); setError(null) }
    } catch (error) {
      if (currentRequest.current === controller) setError(controller.signal.aborted ? 'Tracking health request timed out. Try again.' : error instanceof Error ? error.message : 'Unable to load tracking health.')
    } finally { clearTimeout(timeout); if (currentRequest.current === controller) currentRequest.current = null }
  }, [endpoint, test])
  useEffect(() => {
    void refresh()
    const timer = setInterval(() => { if (!document.hidden) void refresh() }, test ? 5000 : 30000)
    return () => { clearInterval(timer); currentRequest.current?.abort(); currentRequest.current = null }
  }, [refresh, test])
  useEffect(() => () => { testRequest.current?.abort() }, [])
  async function startTest(event: React.FormEvent) {
    event.preventDefault()
    setStarting(true); setTestError(null); setTest(null)
    setHealth(previous => previous ? { ...previous, test: null } : null)
    const controller = new AbortController()
    testRequest.current = controller
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }), signal: controller.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to start installation test.')
      if (!controller.signal.aborted) setTest(data)
    } catch (error) {
      if (!controller.signal.aborted) setTestError(error instanceof Error ? error.message : 'Unable to start installation test.')
      else setTestError('Installation test request timed out. Try again.')
    } finally { clearTimeout(timeout); setStarting(false) }
  }
  const label = health?.status === 'connected' ? 'Receiving events' : health?.status === 'inactive' ? 'No recent events' : health ? 'Waiting for installation' : 'Checking tracking…'
  const testStatus = test && Date.now() >= test.expiresAt && health?.test?.status !== 'passed' ? 'expired' : health?.test?.status
  return (
    <section aria-label="Tracking health" className="rounded-2xl border border-[#e8e6e5] bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#0c0a09] dark:text-white">Tracking health</h3>
        <button type="button" onClick={() => void refresh(true)} className="text-sm text-[#3ba6f1]">Refresh</button>
      </div>
      <p role="status" className="mt-3 text-sm font-medium dark:text-zinc-100">{error ? 'Status unavailable' : label}</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {health && <dl className="mt-3 space-y-2 text-sm text-[#78716c] dark:text-zinc-400">
        <div><dt className="inline">Last activity received: </dt><dd className="inline">{health.lastReceivedAt ? new Date(health.lastReceivedAt).toLocaleString() : 'No events received'}</dd></div>
        <div><dt className="inline">Tracker version: </dt><dd className="inline">{health.trackerVersion || 'Unknown — older installations may not report a version'}{health.trackerVersion && health.trackerVersion !== health.latestTrackerVersion ? ` (current: ${health.latestTrackerVersion})` : ''}</dd></div>
      </dl>}
      <p className="mt-3 text-xs text-[#78716c] dark:text-zinc-400">An inactive site may simply have no visitors. Run an installation test to verify the script.</p>
      <form onSubmit={startTest} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm dark:text-zinc-300">Website URL
          <input type="url" required value={url} onChange={event => setUrl(event.target.value)} placeholder="https://your-website.com" className="mt-1 w-full rounded-xl border border-[#e8e6e5] bg-transparent px-3 py-2 dark:border-zinc-700" />
        </label>
        <button disabled={starting} type="submit" className="self-end rounded-xl bg-[#3ba6f1] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{starting ? 'Preparing…' : 'Prepare installation test'}</button>
      </form>
      {testError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{testError}</p>}
      {test && <div className="mt-4 space-y-2 text-sm dark:text-zinc-300">
        {testStatus !== 'passed' && testStatus !== 'expired' && <a href={test.testUrl} target="_blank" rel="noopener noreferrer" className="text-[#3ba6f1] underline">Open website to send test event ↗</a>}
        <p role="status">{testStatus === 'passed' ? `Test passed. Tracker ${health?.test?.version || 'version unknown'} reached Spectr.` : testStatus === 'expired' ? 'Test expired. Prepare a new test and open the website again.' : 'Waiting for the website’s tracker. This test expires after five minutes.'}</p>
        <p className="text-xs text-[#78716c] dark:text-zinc-400">Test visits are excluded from analytics. If no result arrives, check the script’s project ID, browser blockers, and website security policy. This requires tracker version 2.0.0 or later.</p>
      </div>}
    </section>
  )
}
