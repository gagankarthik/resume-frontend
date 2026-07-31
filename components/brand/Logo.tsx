import Link from 'next/link';

/**
 * Truecopy mark — two sheets held in exact registration.
 * The back sheet is the source document; the front sheet is the copy,
 * offset by a precise, equal amount on both axes. Registration is the idea.
 */
export function TruecopyMark({
  size = 32,
  mono = false,
  className = '',
}: {
  size?: number;
  mono?: boolean;
  className?: string;
}) {
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
        <linearGradient id="tc-mark-grad" x1="11" y1="7" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3FC8F5" />
          <stop offset="1" stopColor="#1F6FEB" />
        </linearGradient>
      </defs>

      {/* source sheet — outline, held behind */}
      <rect
        x="3.6"
        y="3.6"
        width="16.8"
        height="20.8"
        rx="3.4"
        stroke={mono ? 'currentColor' : '#3FC8F5'}
        strokeOpacity={mono ? 0.55 : 0.85}
        strokeWidth="2"
      />

      {/* the copy — set to spec */}
      <rect
        x="11.6"
        y="7.6"
        width="16.8"
        height="20.8"
        rx="3.4"
        fill={mono ? 'currentColor' : 'url(#tc-mark-grad)'}
      />

      {/* set type on the copy */}
      <rect x="15.2" y="12" width="7.2" height="2.4" rx="1.2" fill="#fff" fillOpacity="0.95" />
      <rect x="15.2" y="17" width="9.6" height="2" rx="1" fill="#fff" fillOpacity="0.6" />
      <rect x="15.2" y="21.4" width="6" height="2" rx="1" fill="#fff" fillOpacity="0.6" />
    </svg>
  );
}

/** Full lockup: mark + wordmark. `tone` adapts it to light or dark surfaces. */
export function TruecopyLogo({
  tone = 'light',
  href = '/',
  size = 30,
}: {
  tone?: 'dark' | 'light';
  href?: string | null;
  size?: number;
}) {
  const inner = (
    <span className="flex items-center gap-2">
      <TruecopyMark size={size} />
      <span
        className={`text-[16.5px] font-semibold tracking-[-0.02em] ${
          tone === 'dark' ? 'text-white' : 'text-tc-ink'
        }`}
      >
        Truecopy
      </span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="rounded-lg">
      {inner}
    </Link>
  );
}
