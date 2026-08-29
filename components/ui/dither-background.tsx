"use client";

import React, { useEffect, useRef } from "react";

interface DitherBackgroundProps {
  className?: string;
  imageSrc?: string;
  pixelSize?: number;
}

// 8x8 Bayer Matrix for true ordered dithering
const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];

export function DitherBackground({
  className = "",
  imageSrc = "/bg-image.png",
  pixelSize = 2,
}: DitherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let imgLoaded = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    const renderStaticDither = () => {
      if (!canvas || !imgLoaded) return;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(10, Math.floor(rect.width / pixelSize));
      const h = Math.max(10, Math.floor(rect.height / pixelSize));
      canvas.width = w;
      canvas.height = h;

      const offCanvas = document.createElement("canvas");
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      // Cover fit image
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let dw = w;
      let dh = h;
      let dx = 0;
      let dy = 0;

      if (canvasRatio > imgRatio) {
        dh = w / imgRatio;
        dy = (h - dh) / 2;
      } else {
        dw = h * imgRatio;
        dx = (w - dw) / 2;
      }

      offCtx.drawImage(img, dx, dy, dw, dh);
      const srcData = offCtx.getImageData(0, 0, w, h);
      const outData = ctx.createImageData(w, h);
      const src = srcData.data;
      const out = outData.data;

      // Ordered Dithering Quantization Step
      const colorSteps = 5; // Quantization levels per channel
      const stepSize = 255 / (colorSteps - 1);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          const r = src[idx];
          const g = src[idx + 1];
          const b = src[idx + 2];

          // Normalized threshold from Bayer matrix (-0.5 to 0.5)
          const bayer = (BAYER_8X8[y % 8][x % 8] / 64 - 0.5) * stepSize * 1.1;

          // Dither channels with fine grain
          const dr = Math.max(0, Math.min(255, r + bayer));
          const dg = Math.max(0, Math.min(255, g + bayer));
          const db = Math.max(0, Math.min(255, b + bayer));

          // Quantize to discrete palette
          out[idx] = Math.round(dr / stepSize) * stepSize;
          out[idx + 1] = Math.round(dg / stepSize) * stepSize;
          out[idx + 2] = Math.round(db / stepSize) * stepSize;
          out[idx + 3] = 255;
        }
      }

      ctx.putImageData(outData, 0, 0);
    };

    img.onload = () => {
      imgLoaded = true;
      renderStaticDither();
    };

    if (img.complete && img.naturalWidth !== 0) {
      imgLoaded = true;
      renderStaticDither();
    }

    window.addEventListener("resize", renderStaticDither);

    return () => {
      window.removeEventListener("resize", renderStaticDither);
    };
  }, [imageSrc, pixelSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ imageRendering: "pixelated" }}
      aria-label="Dithered image"
      role="img"
    />
  );
}
