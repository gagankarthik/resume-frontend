import Link from 'next/link';
import SessionCta from './home/SessionCta';
import { EmblemGlyph } from './illustrations/Emblems';

/** The closing band on every marketing page. */
export default function CtaBand({
  title = 'See your talent market.',
  body = 'Format resumes to the agency’s template, rank them against any job, and map where the talent works.',
}: {
  /** Kept for callers that pass a tone; the band is light everywhere. */
  tone?: 'light' | 'dark';
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-white px-5 pb-24 pt-8">
      <div className="beam-border-light relative mx-auto max-w-[1200px] rounded-3xl p-px">
        <div className="relative overflow-hidden rounded-[23px] bg-white px-7 py-16 text-center sm:px-14 sm:py-20">
          <div className="grid-bg-light pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,#000,transparent)]" aria-hidden />
          <div className="pointer-events-none absolute bottom-[-12rem] left-1/2 h-[24rem] w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.18),transparent)]" aria-hidden />
          <div className="relative">
            <div className="mx-auto mb-7 flex w-fit gap-2" aria-hidden>
              {(['ohio', 'pennsylvania', 'georgia', 'oceanblue'] as const).map(id => (
                <span key={id} className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_16px_-12px_rgba(9,9,11,0.35)]">
                  <EmblemGlyph id={id} size={26} />
                </span>
              ))}
            </div>
            <h2 className="fade-text-light mx-auto max-w-[16ch] text-balance text-[36px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[56px]">
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-[32rem] text-[16.5px] leading-[1.6] text-zinc-500">{body}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <SessionCta />
              <Link
                href="/talent-map"
                className="inline-flex h-11 items-center rounded-full border border-zinc-200 bg-white px-6 text-[14.5px] font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Explore the heat map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
