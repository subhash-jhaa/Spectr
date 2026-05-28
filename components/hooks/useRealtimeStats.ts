import { useState, useEffect, useRef, useCallback } from 'react'

interface Visitor {
  id: string
  pageUrl: string
  referrer: string
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
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0)
  const maxReconnectionAttempts = 5
  const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const setupRealtimeConnection = useCallback(() => {
    if (!selectedProjectId) return
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectionTimeoutRef.current) {
      clearTimeout(reconnectionTimeoutRef.current)
    }

    if (reconnectionAttempts >= maxReconnectionAttempts) {
      console.log('Max reconnection attempts reached.')
      setIsConnecting(false)
      return
    }

    setIsConnecting(true)
    setRealtimeConnected(false)
    console.log(`Attempting to connect (attempt ${reconnectionAttempts + 1})`)

    const eventSource = new EventSource(`/api/realtime?projectId=${selectedProjectId}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('SSE connection established')
      setIsConnecting(false)
      setRealtimeConnected(true)
      setReconnectionAttempts(0)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'error') {
          console.error('SSE server error:', data.message)
          eventSource.close()
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
      console.log('SSE connection error. Scheduling reconnect.')
      eventSource.close()
      setIsConnecting(false)
      setRealtimeConnected(false)

      const nextAttempt = reconnectionAttempts + 1
      const delay = Math.min(1000 * Math.pow(2, nextAttempt), 30000)

      reconnectionTimeoutRef.current = setTimeout(() => {
        setReconnectionAttempts(nextAttempt)
      }, delay)
    }
  }, [selectedProjectId, reconnectionAttempts])

  useEffect(() => {
    if (selectedProjectId) {
      setupRealtimeConnection()
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current)
      }
    }
  }, [selectedProjectId, reconnectionAttempts, setupRealtimeConnection])

  const retryConnection = useCallback(() => {
    setReconnectionAttempts(0)
  }, [])

  return {
    realtimeStats,
    isConnecting,
    realtimeConnected,
    reconnectionAttempts,
    maxReconnectionAttempts,
    retryConnection,
    setupRealtimeConnection
  }
}
