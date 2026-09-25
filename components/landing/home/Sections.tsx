import Link from 'next/link';
import type { ReactNode } from 'react';
import UsHeatMap from '../product/UsHeatMap';
import { FormatFlow } from '../product/SampleCharts';
import FitRadar from '../illustrations/FitRadar';
import { GlyphCheck, GlyphExport, GlyphExtract, GlyphRead, GlyphReview } from '../illustrations/StepGlyphs';
import { DataPath } from '../Security';
import SpotlightCard from './SpotlightCard';
import NormalizeDemo from './NormalizeDemo';

/* ── Shared ──────────────────────────────────────────────────────────────── */

export function SectionTitle({ kicker, title, lede, center = false }: { kicker: string; title: string; lede?: string; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-[46rem] text-center' : 'max-w-[42rem]'}>
      <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-indigo-600">{kicker}</p>
      <h2 className="fade-text-light mt-4 text-balance text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[54px]">{title}</h2>
      {lede && <p className="mt-5 text-[17px] leading-[1.6] text-zinc-500">{lede}</p>}
    </div>
  );
}

function More({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-zinc-900">
      {children}
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
        <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function CardText({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-zinc-900">{title}</h3>
      <p className="mt-2 max-w-[34rem] text-[14.5px] leading-[1.6] text-zinc-500">{body}</p>
    </>
  );
}

/* ── Bento ───────────────────────────────────────────────────────────────── */

export function Bento() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <SectionTitle kicker="Platform" title="Everything the submittal desk runs on." lede="One extraction per resume. Formatting, matching and the talent map all read from it." />

        <div className="mt-16 grid gap-4 md:grid-cols-6">
          <SpotlightCard className="md:col-span-4 md:row-span-2">
            <div className="flex h-full flex-col p-7 sm:p-8">
              <CardText title="Talent heat map" body="Every resume becomes a point at its employer. See the pockets of talent, rank the companies near you, and open the people behind them." />
              <More href="/talent-map">Explore the heat map</More>
              <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border border-zinc-100" style={{ minHeight: 260 }}>
                <UsHeatMap tone="vivid" animate={false} />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="md:col-span-2">
            <div className="p-7">
              <CardText title="Ranked with reasons" body="Paste a job. Every resume scored, with the skills that matched and the ones missing." />
              <div className="mx-auto mt-4 max-w-[230px]">
                <FitRadar />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="md:col-span-2">
            <div className="p-7">
              <CardText title="Clean data, automatically" body="Spellings of one employer become one company. Titles and skills are normalized." />
              <div className="mt-6"><NormalizeDemo /></div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="md:col-span-3">
            <div className="p-7">
              <CardText title="Any resume in, the agency’s template out" body="Checked against the source word for word, then set to Ohio, Pennsylvania, Georgia or Oceanblue." />
              <div className="mt-4"><FormatFlow /></div>
              <More href="/formatting">How formatting works</More>
            </div>
          </SpotlightCard>

          <SpotlightCard className="md:col-span-3">
            <div className="p-7">
              <CardText title="Private by design" body="Files are read in memory, the map keeps no contact details, and your organisation sees only its own data." />
              <div className="mt-4"><DataPath /></div>
              <More href="/security">Security details</More>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

/* ── Facts ───────────────────────────────────────────────────────────────── */

export function Facts() {
  const facts = [
    ['20+', 'resume sections, word for word'],
    ['4', 'state templates, built in'],
    ['0–100', 'fit score, with reasons'],
    ['1', 'table for every extraction'],
  ];
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/60">
      <dl className="mx-auto grid max-w-[1200px] grid-cols-2 lg:grid-cols-4">
        {facts.map(([n, l], i) => (
          <div key={l} className={`px-6 py-12 text-center ${i % 2 ? 'border-l border-zinc-100' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
            <dt className="fade-text-light text-[44px] font-semibold leading-none tracking-[-0.05em] sm:text-[56px]">{n}</dt>
            <dd className="mt-3 text-[14px] text-zinc-500">{l}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ── Steps ───────────────────────────────────────────────────────────────── */

export function Steps() {
  const steps = [
    [GlyphRead, 'Add resumes', 'PDF, Word or text — uploaded here, applied on the website, or sent for matching.'],
    [GlyphExtract, 'Extracted once', 'Every section read word for word and saved to one table.'],
    [GlyphCheck, 'Checked', 'Every line matched back to the source. Gaps are flagged.'],
    [GlyphReview, 'Reviewed', 'A full editor sits between extraction and export.'],
    [GlyphExport, 'Used everywhere', 'Export the template, rank against a job, see the map.'],
  ] as const;
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <SectionTitle kicker="How it works" title="One extraction. Every product." center />
        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <span className="absolute left-[8%] right-[8%] top-9 hidden h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent lg:block" aria-hidden />
          {steps.map(([Glyph, t, s], i) => (
            <li key={t} className="relative text-center">
              <span className="relative z-10 mx-auto grid h-[72px] w-[72px] place-items-center rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_24px_-16px_rgba(79,70,229,0.5)]">
                <Glyph size={42} />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-zinc-950 font-mono text-[11px] text-white">
                  {i + 1}
                </span>
              </span>
              <p className="mt-5 text-[16.5px] font-semibold text-zinc-900">{t}</p>
              <p className="mx-auto mt-2 max-w-[15rem] text-[14px] leading-[1.6] text-zinc-500">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
