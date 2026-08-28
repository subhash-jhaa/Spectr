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
  const [isFallbackPolling, setIsFallbackPolling] = useState(false)
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0)
  const maxReconnectionAttempts = 3

  const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fallback REST fetcher
  const fetchFallbackStats = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/stats/project/${projectId}/realtime`)
      if (res.ok) {
        const json = await res.json()
        if (json && typeof json.count === 'number') {
          setRealtimeStats({
            count: json.count,
            visitors: json.visitors || []
          })
          setIsFallbackPolling(true)
        }
      }
    } catch (e) {
      console.debug('Polling fallback error:', e)
    }
  }, [])

  // Start HTTP polling fallback if SSE fails or disconnects
  const startFallbackPolling = useCallback((projectId: string) => {
    if (pollingIntervalRef.current) return
    setIsFallbackPolling(true)
    fetchFallbackStats(projectId)
    pollingIntervalRef.current = setInterval(() => {
      fetchFallbackStats(projectId)
    }, 5000)
  }, [fetchFallbackStats])

  const stopFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsFallbackPolling(false)
  }, [])

  const connect = useCallback((projectId: string, attempt: number) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectionTimeoutRef.current) {
      clearTimeout(reconnectionTimeoutRef.current)
      reconnectionTimeoutRef.current = null
    }

    if (attempt >= maxReconnectionAttempts) {
      console.log('Max SSE reconnection attempts reached, switching to polling fallback.')
      setIsConnecting(false)
      setRealtimeConnected(false)
      startFallbackPolling(projectId)
      return
    }

    setIsConnecting(true)
    setRealtimeConnected(false)

    try {
      const eventSource = new EventSource(`/api/realtime?projectId=${projectId}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnecting(false)
        setRealtimeConnected(true)
        setReconnectionAttempts(0)
        stopFallbackPolling()
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'error') {
            console.warn('SSE server error:', data.message)
            eventSource.close()
            setIsConnecting(false)
            setRealtimeConnected(false)
            startFallbackPolling(projectId)
            return
          }
          if (data.type === 'stats') {
            setRealtimeStats(data)
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        eventSourceRef.current = null
        setIsConnecting(false)
        setRealtimeConnected(false)

        // Switch to polling immediately while retrying in background
        startFallbackPolling(projectId)

        const nextAttempt = attempt + 1
        setReconnectionAttempts(nextAttempt)

        if (nextAttempt < maxReconnectionAttempts) {
          const delay = Math.min(1000 * Math.pow(2, nextAttempt), 10000)
          reconnectionTimeoutRef.current = setTimeout(() => {
            connect(projectId, nextAttempt)
          }, delay)
        }
      }
    } catch (e) {
      console.error('Failed to create EventSource:', e)
      setIsConnecting(false)
      setRealtimeConnected(false)
      startFallbackPolling(projectId)
    }
  }, [maxReconnectionAttempts, startFallbackPolling, stopFallbackPolling])

  useEffect(() => {
    if (!selectedProjectId) {
      setRealtimeStats({ count: 0, visitors: [] })
      setIsConnecting(false)
      setRealtimeConnected(false)
      stopFallbackPolling()
      return
    }

    setReconnectionAttempts(0)
    connect(selectedProjectId, 0)

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current)
        reconnectionTimeoutRef.current = null
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [selectedProjectId, connect, stopFallbackPolling])

  const retryConnection = useCallback(() => {
    if (!selectedProjectId) return
    setReconnectionAttempts(0)
    connect(selectedProjectId, 0)
  }, [selectedProjectId, connect])

  return {
    realtimeStats,
    isConnecting,
    realtimeConnected,
    isFallbackPolling,
    reconnectionAttempts,
    maxReconnectionAttempts,
    retryConnection
  }
}
