'use client';

import Link from 'next/link';

const LINKS = [
  { href: '#pipeline', label: 'The Line' },
  { href: '#formats', label: 'Formats' },
  { href: '#capabilities', label: 'Capabilities' },
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border-2 border-ink bg-ink font-mono text-sm font-semibold text-paper hard-shadow-sm">
            RK
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-black tracking-tight text-ink">RESUMEKIT</span>
            <span className="mt-0.5 hidden font-mono text-[10px] tracking-[0.14em] text-ink/60 sm:block">
              OCEANBLUE SOLUTIONS
            </span>
          </span>
        </Link>

        {/* Section links */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-signal"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/upload"
          className="lift-block hard-shadow-sm border-2 border-ink bg-signal px-4 py-2 text-[12px] font-extrabold uppercase tracking-wide text-white"
        >
          Start a conversion
        </Link>
      </div>
    </header>
  );
}
