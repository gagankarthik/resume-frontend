'use client';

import type { ReactNode } from 'react';
import ParticleSphere from './ParticleSphere';

/**
 * Orbiting rings around a particle core.
 *
 * The rings carry what actually travels through Truecopy: the file types that
 * go in, and the agency templates that come out. Chips counter-rotate so their
 * labels stay upright as the ring turns.
 */

export type OrbitChip = {
  /** Short label shown in the chip — a file extension or a state code. */
  label: string;
  /** Where on the ring it starts, in degrees. */
  angle: number;
  /** Accent applied to the chip's text. */
  tone?: string;
  icon?: ReactNode;
};

export type Orbit = {
  /** Ring diameter, as Tailwind sizing for the two breakpoints. */
  size: string;
  /** Seconds for one revolution. */
  duration: number;
  chips: OrbitChip[];
};

export default function OrbitingCircles({
  orbits,
  className = '',
}: {
  orbits: Orbit[];
  className?: string;
}) {
  return (
    <div className={`relative flex w-full justify-center overflow-hidden ${className}`}>
      <style>{`
        @keyframes tc-orbit-cw {
          from { transform: rotate(var(--start-angle)); }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)); }
        }
        @keyframes tc-orbit-ccw {
          from { transform: rotate(var(--start-angle)); }
          to   { transform: rotate(calc(var(--start-angle) - 360deg)); }
        }
        @keyframes tc-counter-cw {
          from { transform: rotate(var(--counter-offset, 0deg)); }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) - 360deg)); }
        }
        @keyframes tc-counter-ccw {
          from { transform: rotate(var(--counter-offset, 0deg)); }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) + 360deg)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tc-orbit-ring [style*="tc-orbit"],
          .tc-orbit-ring [style*="tc-counter"] { animation: none !important; }
        }
      `}</style>

      {/* Core */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 aspect-square w-52 -translate-x-1/2 translate-y-1/2 md:w-[19rem]">
        <ParticleSphere />
      </div>

      {orbits.map((orbit, index) => {
        const clockwise = index % 2 === 0;
        const ring = clockwise ? 'tc-orbit-cw' : 'tc-orbit-ccw';
        const counter = clockwise ? 'tc-counter-cw' : 'tc-counter-ccw';

        return (
          <div
            key={index}
            className={`tc-orbit-ring absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-tc-line ${orbit.size}`}
          >
            {orbit.chips.map((chip, i) => (
              <div
                key={`${chip.label}-${i}`}
                className="absolute left-1/2 top-0 flex h-1/2 origin-bottom flex-col items-center justify-start"
                style={
                  {
                    marginLeft: '-1.75rem',
                    '--start-angle': `${chip.angle}deg`,
                    animation: `${ring} ${orbit.duration}s linear infinite`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="relative z-10 -mt-5 flex h-10 min-w-[2.75rem] items-center justify-center gap-1.5 rounded-full border border-tc-line bg-white px-3 shadow-[0_2px_10px_-4px_rgba(11,27,51,0.25)]"
                  style={
                    {
                      '--counter-offset': `${-chip.angle}deg`,
                      animation: `${counter} ${orbit.duration}s linear infinite`,
                    } as React.CSSProperties
                  }
                >
                  {chip.icon}
                  <span
                    className="font-mono text-[11px] font-medium tracking-tight"
                    style={{ color: chip.tone ?? 'var(--color-tc-muted)' }}
                  >
                    {chip.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
