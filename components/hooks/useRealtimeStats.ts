import { useState, useEffect, useRef, useCallback } from 'react'

interface Visitor {
  id: string
  pageUrl: string
  referrer: string
  source: string
  country: string
  city: string
  userAgent: string
  timestamp: string
}

interface RealtimeStats {
  count: number
  visitors: Visitor[]
}

export const useRealtimeStats = (selectedProjectId: string | undefined) => {
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({ count: 0, visitors: [] })
  const [isConnecting, setIsConnecting] = useState(false)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFallbackPolling, setIsFallbackPolling] = useState(false)
  const reconnectionAttempts = 0
  const maxReconnectionAttempts = 3

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFetchingRef = useRef(false)

  // Direct DB-backed REST fetcher for live visitor telemetry
  const fetchLiveStats = useCallback(async (projectId: string) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const res = await fetch(`/api/stats/project/${projectId}/realtime`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (res.ok) {
        const json = await res.json()
        if (json && typeof json.count === 'number') {
          setRealtimeStats({
            count: json.count,
            visitors: json.visitors || []
          })
          setRealtimeConnected(true)
          setHasError(false)
          setErrorMessage(null)
          setIsFallbackPolling(true)
        }
      } else {
        const errJson = await res.json().catch(() => ({}))
        setHasError(true)
        setRealtimeConnected(false)
        setErrorMessage(errJson.error || `HTTP ${res.status}: Realtime DB query failed`)
      }
    } catch (e) {
      console.debug('Live stats sync error:', e)
      setHasError(true)
      setRealtimeConnected(false)
      setErrorMessage('Network error fetching live stats')
    } finally {
      isFetchingRef.current = false
      setIsConnecting(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedProjectId) {
      setRealtimeStats({ count: 0, visitors: [] })
      setIsConnecting(false)
      setRealtimeConnected(false)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    setIsConnecting(true)

    // 1. Fetch immediately on mount / project change
    fetchLiveStats(selectedProjectId)

    // 2. Poll every 3 seconds for continuous, serverless-safe real-time telemetry
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(() => {
      if (!document.hidden) {
        fetchLiveStats(selectedProjectId)
      }
    }, 3000)

    // 3. Immediately re-fetch when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedProjectId) {
        fetchLiveStats(selectedProjectId)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [selectedProjectId, fetchLiveStats])

  const retryConnection = useCallback(() => {
    if (!selectedProjectId) return
    setIsConnecting(true)
    fetchLiveStats(selectedProjectId)
  }, [selectedProjectId, fetchLiveStats])

  return {
    realtimeStats,
    isConnecting,
    realtimeConnected,
    hasError,
    errorMessage,
    isFallbackPolling,
    reconnectionAttempts,
    maxReconnectionAttempts,
    retryConnection
  }
}
