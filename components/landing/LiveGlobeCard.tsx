"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { Globe } from "lucide-react";
import { useTheme } from "next-themes";

interface MarkerItem {
  id: string;
  location: [number, number];
  count: number;
}

const MARKERS: MarkerItem[] = [
  { id: "us", location: [40.71, -74.01], count: 14 },
  { id: "de", location: [52.52, 13.41], count: 11 },
  { id: "jp", location: [35.68, 139.65], count: 9 },
  { id: "in", location: [28.61, 77.20], count: 7 },
  { id: "gb", location: [51.51, -0.13], count: 6 },
  { id: "br", location: [-23.55, -46.63], count: 5 },
  { id: "au", location: [-33.87, 151.21], count: 3 },
];

export function LiveGlobeCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const markerElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;
    const isDark = resolvedTheme === "dark";
    const theta = 0.25;

    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: 420 * 2,
        height: 420 * 2,
        phi: 0,
        theta,
        dark: isDark ? 1 : 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: isDark ? 4 : 5.5,
        baseColor: isDark ? [0.15, 0.15, 0.18] : [0.93, 0.93, 0.94],
        markerColor: [0.23, 0.65, 0.95],
        glowColor: isDark ? [0.15, 0.15, 0.2] : [0.88, 0.88, 0.9],
        markers: MARKERS.map((m) => ({ location: m.location, size: 0.08 })),
        markerElevation: 0,
        arcs: [],
        arcColor: [0.23, 0.65, 0.95],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.9,
      });

      function animate() {
        phi += 0.005;
        globe?.update({ phi, theta });

        // Calculate real-time 3D projection for each visitor badge
        const container = globeContainerRef.current;
        if (container) {
          const width = container.offsetWidth || 380;
          const cx = width / 2;
          const cy = width / 2;
          const R = (width / 2) * 0.95;

          MARKERS.forEach((m, idx) => {
            const el = markerElementsRef.current[idx];
            if (!el) return;

            const latRad = (m.location[0] * Math.PI) / 180;
            const lonRad = (m.location[1] * Math.PI) / 180;

            const x0 = Math.cos(latRad) * Math.sin(lonRad + phi);
            const y0 = Math.sin(latRad);
            const z0 = Math.cos(latRad) * Math.cos(lonRad + phi);

            const x = x0;
            const y = y0 * Math.cos(theta) - z0 * Math.sin(theta);
            const z = y0 * Math.sin(theta) + z0 * Math.cos(theta);

            if (z > 0.05) {
              const left = cx + x * R;
              const top = cy - y * R;
              const opacity = Math.min(1, Math.max(0, (z - 0.05) / 0.35));
              const scale = 0.85 + z * 0.2;
              el.style.transform = `translate3d(${left}px, ${top}px, 0) translate(-50%, -120%) scale(${scale})`;
              el.style.opacity = `${opacity}`;
              el.style.display = "flex";
            } else {
              el.style.opacity = "0";
              el.style.display = "none";
            }
          });
        }

        animationId = requestAnimationFrame(animate);
      }

      animationId = requestAnimationFrame(animate);
    } catch {
      // ignore
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [resolvedTheme, mounted]);

  return (
    <div className="relative overflow-hidden w-full h-full min-h-[320px] sm:min-h-[360px] flex flex-col justify-between">
      {/* Top Right Badge */}
      <div className="absolute top-0 right-0 z-20">
        <span className="inline-flex items-center rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-[#f5f5f4] dark:bg-zinc-900/90 px-3 py-1 text-xs sm:text-[13px] font-mono text-[#78716c] dark:text-zinc-300 font-normal shadow-sm">
          no setup required
        </span>
      </div>

      {/* Header & Title */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3.5">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#f5f5f4] dark:bg-zinc-900 border border-[#e8e6e5] dark:border-zinc-800 text-[#3ba6f1]">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-roobert font-semibold text-[#0c0a09] dark:text-white text-xl sm:text-2xl flex items-center gap-2.5">
            <span>Live View</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h3>
        </div>

        <p className="text-sm sm:text-base md:text-[17px] text-[#78716c] dark:text-zinc-400 max-w-[260px] leading-relaxed">
          Interactive globe view of your visitors.
        </p>
      </div>

      {/* Floating Rotating Cobe Globe Container */}
      <div 
        ref={globeContainerRef}
        className="absolute -right-10 -bottom-12 sm:-right-8 sm:-bottom-10 pointer-events-none select-none z-0 w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px]"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-90 transition-opacity duration-700"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Dynamic 3D Projected Live Visitor Badges */}
        {MARKERS.map((m, idx) => (
          <div
            key={m.id}
            ref={(el) => {
              markerElementsRef.current[idx] = el;
            }}
            className="absolute top-0 left-0 pointer-events-none z-10 will-change-transform items-center gap-1.5 bg-[#0c0a09]/90 dark:bg-zinc-900/95 border border-white/20 dark:border-white/15 text-white rounded-full px-2.5 py-0.5 text-xs font-mono shadow-lg backdrop-blur-md transition-opacity duration-200"
            style={{ display: "none", opacity: 0 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">{m.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveGlobeCard;
