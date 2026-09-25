import { useId } from 'react';
import Link from 'next/link';

/**
 * Blue-IQ Hire mark — one record, four formats.
 *
 * A circle split down the middle. The left half is whole: the candidate's
 * record, extracted once. The right half is cut into four equal bands that
 * keep the circle's outline: the same record set four ways, still one thing.
 */

export const BRAND = {
  ultramarine: '#2A45D8',
  ocean: '#1AA3C8',
  ink: '#0C1B33',
};

/* Four bands across the circle's height (y 3 → 29), 1.5 units apart. */
const BANDS = [3, 9.875, 16.75, 23.625];
const BAND_H = 5.375;

export function HireMark({
  size = 32,
  mono = false,
  className = '',
}: {
  size?: number;
  mono?: boolean;
  className?: string;
}) {
  const clip = `hire-mark-${useId().replace(/:/g, '')}`;
  const left = mono ? 'currentColor' : BRAND.ultramarine;
  const right = mono ? 'currentColor' : BRAND.ocean;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="16" cy="16" r="13" />
        </clipPath>
      </defs>
      {/* the record */}
      <path d="M15 3.04a13 13 0 0 0 0 25.92Z" fill={left} />
      {/* the four formats */}
      <g clipPath={`url(#${clip})`} fill={right} fillOpacity={mono ? 0.6 : 1}>
        {BANDS.map(y => (
          <rect key={y} x="17" y={y} width="13" height={BAND_H} />
        ))}
      </g>
    </svg>
  );
}

/** Full lockup: mark + wordmark. `tone` adapts it to light or dark surfaces. */
export function HireLogo({
  tone = 'light',
  href = '/',
  size = 30,
}: {
  tone?: 'dark' | 'light';
  href?: string | null;
  size?: number;
}) {
  const dark = tone === 'dark';
  const inner = (
    <span className="flex items-center gap-2.5">
      <HireMark size={size} />
      <span className="flex items-baseline gap-[5px] text-[17px] leading-none tracking-[-0.025em]">
        <span className={`font-bold ${dark ? 'text-white' : 'text-tc-ink'}`}>Blue-IQ</span>
        <span className={`font-medium ${dark ? 'text-white/60' : 'text-tc-muted'}`}>Hire</span>
      </span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} aria-label="Blue-IQ Hire home" className="rounded-lg">
      {inner}
    </Link>
  );
}
