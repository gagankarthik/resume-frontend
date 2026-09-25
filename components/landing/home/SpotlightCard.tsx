'use client';

import { useRef, type ReactNode } from 'react';

/**
 * A card with a soft light that follows the pointer, and a border that
 * brightens under it. The position is written to CSS variables on the element,
 * so moving the mouse never re-renders React.
 */
export default function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={e => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--x', `${e.clientX - r.left}px`);
        el.style.setProperty('--y', `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-24px_rgba(79,70,229,0.35)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--x) var(--y), rgba(99,102,241,0.07), transparent 60%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: 1,
          background: 'radial-gradient(260px circle at var(--x) var(--y), rgba(99,102,241,0.55), transparent 60%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
