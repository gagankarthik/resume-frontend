'use client';

import { useEffect, useRef } from 'react';

/**
 * A sphere of drifting points, drawn on canvas.
 *
 * Stands in for the record at the centre of the product: a mass of individual
 * fields, held together and turning slowly. Points nearer the viewer are
 * larger and more opaque, which is the only depth cue used.
 */
export default function ParticleSphere({
  count = 620,
  color = '#1F6FEB',
  className = '',
}: {
  count?: number;
  color?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fibonacci sphere — even coverage without clustering at the poles.
    const points = Array.from({ length: count }, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
    });

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const rgb = hexToRgb(color);
    let angle = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * 0.42;

      // Tilt keeps the sphere from reading as a flat ring.
      const tilt = -0.32;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      for (const p of points) {
        const x1 = p.x * cosA - p.z * sinA;
        const z1 = p.x * sinA + p.z * cosA;
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;

        const depth = (z2 + 1) / 2; // 0 back, 1 front
        const size = 0.5 + depth * 1.7;
        const alpha = 0.06 + depth * depth * 0.5;

        ctx.beginPath();
        ctx.arc(cx + x1 * r, cy + y2 * r, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.fill();
      }

      if (!reduced) {
        angle += 0.0022;
        raf = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [count, color]);

  return <canvas ref={canvasRef} className={`h-full w-full ${className}`} aria-hidden="true" />;
}

function hexToRgb(hex: string): string {
  const v = hex.replace('#', '');
  const n = parseInt(
    v.length === 3
      ? v
          .split('')
          .map(c => c + c)
          .join('')
      : v,
    16,
  );
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
