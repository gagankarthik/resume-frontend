import type { ReactNode } from 'react';

/**
 * Shared typography for the legal documents so all six read as one set.
 */
export function DocHeader({ title, updated }: { title: string; updated: string }) {
  return (
    <header className="border-b border-tc-line pb-8">
      <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] text-tc-ink">
        {title}
      </h1>
      <p className="mt-3 text-[13.5px] text-tc-faint">Last updated {updated}</p>
    </header>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-tc-ink">{title}</h2>
      <div className="mt-3 space-y-4 text-[15px] leading-[1.7] text-tc-muted">{children}</div>
    </section>
  );
}

export function DocList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[9px] h-[4px] w-[4px] shrink-0 rounded-full bg-tc-faint" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function DocNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 rounded-xl border border-tc-line bg-tc-desk/60 p-5 text-[14px] leading-[1.65] text-tc-muted">
      {children}
    </div>
  );
}
