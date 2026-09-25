import type { ReactNode } from 'react';
import Link from 'next/link';

export type Crumb = { href: string; label: string };

/** The soft heat-map glow the site uses behind its opening bands. */
export function HeatGlow({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute -top-40 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(42,69,216,0.16),rgba(26,163,200,0.08)_55%,transparent)]" />
      <div className="absolute -right-40 top-10 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(180,35,122,0.08),transparent)]" />
    </div>
  );
}

/**
 * The opening band every inner marketing page starts with: light, with the
 * navigation over it, breadcrumbs, a title, one line of lede and optional art.
 */
export default function PageHero({
  crumbs,
  title,
  lede,
  actions,
  art,
}: {
  crumbs?: Crumb[];
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  art?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-tc-line bg-white">
      <HeatGlow />
      <div
        className={`relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-16 pt-32 sm:pt-36 lg:pb-20 ${
          art ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14' : ''
        }`}
      >
        <div className="max-w-[40rem]">
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-[13.5px] text-tc-muted">
                {crumbs.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-2">
                    {i > 0 && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="text-tc-faint">
                        <path d="m4.5 3 3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {i === crumbs.length - 1 ? (
                      <span aria-current="page" className="text-tc-ink">{c.label}</span>
                    ) : (
                      <Link href={c.href} className="transition-colors hover:text-tc-ink">{c.label}</Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 className="text-balance text-[40px] font-bold leading-[1.04] tracking-[-0.04em] text-tc-ink sm:text-[56px]">
            {title}
          </h1>
          {lede && <p className="mt-5 max-w-[34rem] text-[18px] leading-[1.55] text-tc-muted">{lede}</p>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {art && <div className="relative">{art}</div>}
      </div>
    </section>
  );
}
