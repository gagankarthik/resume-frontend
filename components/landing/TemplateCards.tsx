import Link from 'next/link';
import { Emblem } from './illustrations/Emblems';
import { TEMPLATE_PAGES } from '@/lib/site/content';

/**
 * The four templates as a comparison: one column each, the same facts in the
 * same rows, so the differences line up. Each column links to its page.
 */
export default function TemplateCards({ exclude }: { exclude?: string }) {
  const list = TEMPLATE_PAGES.filter(t => t.slug !== exclude);
  return (
    <ul className={`grid gap-px overflow-hidden rounded-xl border border-tc-line bg-tc-line sm:grid-cols-2 ${list.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      {list.map(t => (
        <li key={t.id} className="bg-white">
          <Link href={`/templates/${t.slug}`} className="group flex h-full flex-col p-6 transition-colors hover:bg-tc-desk">
            <Emblem id={t.id} size={56} />
            <h3 className="mt-5 flex items-center gap-2 text-[18px] font-semibold tracking-[-0.015em] text-tc-ink">
              {t.name}
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
                className="text-tc-faint transition-transform group-hover:translate-x-0.5 group-hover:text-tc-azure"
              >
                <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </h3>
            <p className="mt-1 text-[14px] text-tc-muted">{t.blurb}</p>
            <dl className="mt-6 space-y-3 border-t border-tc-line pt-5 text-[13.5px]">
              <div>
                <dt className="text-tc-faint">Submitted through</dt>
                <dd className="mt-0.5 font-medium text-tc-ink">{t.submittedThrough}</dd>
              </div>
              <div>
                <dt className="text-tc-faint">Best for</dt>
                <dd className="mt-0.5 font-medium text-tc-ink">{t.bestFor}</dd>
              </div>
              <div>
                <dt className="text-tc-faint">Opens with</dt>
                <dd className="mt-0.5 font-medium text-tc-ink">{t.order[1]}</dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  );
}
