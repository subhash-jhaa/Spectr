"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function CobeGlobe({ className }: { className?: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		let globe: ReturnType<typeof createGlobe> | null = null;
		let rafId = 0;
		let phi = 0;

		const init = () => {
			const side = canvas.offsetWidth || 500;
			if (globe) {
				return;
			}

			const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

			globe = createGlobe(canvas, {
				devicePixelRatio: dpr,
				width: side * dpr,
				height: side * dpr,
				phi: 0,
				theta: 0.35,
				dark: 1,
				diffuse: 1.8,
				mapSamples: 24_000,
				mapBrightness: 8,
				baseColor: [0.45, 0.45, 0.45],
				markerColor: [0.1, 0.8, 1],
				glowColor: [1.3, 1.3, 1.3],
				markers: [
					{ location: [37.7595, -122.4367], size: 0.1 },
					{ location: [40.7128, -74.006], size: 0.12 },
					{ location: [51.5074, -0.1278], size: 0.08 },
					{ location: [28.6139, 77.2090], size: 0.09 },
				],
			});

			const loop = () => {
				phi += 0.007;
				globe?.update({ phi });
				rafId = requestAnimationFrame(loop);
			};
			loop();
		};

		let ro: ResizeObserver | null = null;

		if (canvas.offsetWidth > 0) {
			init();
		} else {
			ro = new ResizeObserver((entries) => {
				if (
					entries[0]?.contentRect.width &&
					entries[0]?.contentRect.width > 0
				) {
					ro?.disconnect();
					ro = null;
					init();
				}
			});
			ro.observe(canvas);
		}

		return () => {
			ro?.disconnect();
			cancelAnimationFrame(rafId);
			globe?.destroy();
		};
	}, []);

	return (
		<canvas
			className={className}
			ref={canvasRef}
			style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
		/>
	);
}
