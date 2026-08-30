"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

export interface AnalyticsMarker {
  id: string
  location: [number, number]
  visitors: number
  trend: number
  label?: string
}

export interface GlobeAnalyticsProps {
  markers?: AnalyticsMarker[]
  className?: string
  speed?: number
  dark?: number
  baseColor?: [number, number, number]
  markerColor?: [number, number, number]
  glowColor?: [number, number, number]
}

const defaultMarkers: AnalyticsMarker[] = [
  { id: "vis-1", location: [40.71, -74.01], visitors: 847, trend: 12, label: "New York" },
  { id: "vis-2", location: [51.51, -0.13], visitors: 623, trend: -3, label: "London" },
  { id: "vis-3", location: [35.68, 139.65], visitors: 412, trend: 8, label: "Tokyo" },
  { id: "vis-4", location: [48.86, 2.35], visitors: 385, trend: 5, label: "Paris" },
  { id: "vis-5", location: [-33.87, 151.21], visitors: 201, trend: 15, label: "Sydney" },
  { id: "vis-6", location: [52.52, 13.41], visitors: 178, trend: -1, label: "Berlin" },
  { id: "vis-7", location: [28.61, 77.20], visitors: 540, trend: 22, label: "New Delhi" },
  { id: "vis-8", location: [37.77, -122.41], visitors: 310, trend: 7, label: "San Francisco" },
]

export function GlobeAnalytics({
  markers: initialMarkers = defaultMarkers,
  className = "",
  speed = 0.003,
  dark = 0,
  baseColor = [1, 1, 1],
  markerColor = [0.23, 0.65, 0.95],
  glowColor = [0.94, 0.93, 0.91],
}: GlobeAnalyticsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const [data, setData] = useState(initialMarkers)

  useEffect(() => {
    setData(initialMarkers)
  }, [initialMarkers])

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((m) => ({
          ...m,
          visitors: Math.max(1, m.visitors + Math.floor(Math.random() * 7) - 3),
          trend: Math.max(-20, Math.min(20, m.trend + Math.floor(Math.random() * 5) - 2)),
        }))
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.2,
        dark,
        diffuse: 1.5,
        mapSamples: 20000,
        mapBrightness: 10,
        baseColor,
        markerColor,
        glowColor,
        markerElevation: 0,
        markers: initialMarkers.map((m) => ({ location: m.location, size: 0.05, id: m.id })),
        arcs: [],
        arcColor: [0.23, 0.65, 0.95],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe?.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => {
        if (canvas) canvas.style.opacity = "1"
      }, 50)
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [initialMarkers, speed, dark, baseColor, markerColor, glowColor])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {data.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            // @ts-expect-error CSS Anchor Positioning
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 6,
            display: "flex",
            alignItems: "baseline",
            gap: "0.35rem",
            padding: "0.3rem 0.5rem",
            background: "rgba(0,0,0,0.85)",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.1)",
            pointerEvents: "none" as const,
            whiteSpace: "nowrap" as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.3s, filter 0.3s",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {m.label && (
            <span style={{ fontSize: "0.75rem", color: "#a1a1aa", marginRight: 2 }}>
              {m.label}:
            </span>
          )}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {m.visitors}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: m.trend >= 0 ? "#34d399" : "#f87171",
            }}
          >
            {m.trend >= 0 ? "↑" : "↓"} {Math.abs(m.trend)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default GlobeAnalytics
