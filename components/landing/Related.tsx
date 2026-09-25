import Link from 'next/link';
import type { ReactNode } from 'react';

export type RelatedLink = { href: string; title: string; body: string; icon: ReactNode };

/** "Where to next" — links to the pages that answer the reader's next question. */
export default function Related({ links, title = 'Keep reading' }: { links: RelatedLink[]; title?: string }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-5">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-tc-ink">{title}</h2>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-xl border border-tc-line bg-tc-line sm:grid-cols-2 lg:grid-cols-3">
          {links.map(l => (
            <li key={l.href} className="bg-white">
              <Link href={l.href} className="group flex h-full items-start gap-4 p-6 transition-colors hover:bg-tc-desk">
                {l.icon}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[16px] font-semibold text-tc-ink">
                    {l.title}
                    <svg
                      width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
                      className="text-tc-faint transition-transform group-hover:translate-x-0.5 group-hover:text-tc-azure"
                    >
                      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="mt-1 block text-[14px] leading-[1.55] text-tc-muted">{l.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
