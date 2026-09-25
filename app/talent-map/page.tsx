import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import SectionHeading from '@/components/landing/SectionHeading';
import SampleMap from '@/components/landing/product/SampleMap';
import { CompanyBars } from '@/components/landing/product/SampleCharts';
import HeatModes from '@/components/landing/HeatModes';
import Related from '@/components/landing/Related';
import { navTileFor } from '@/components/landing/related-links';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Talent heat map: see where talent works, by employer, skill and metro',
  description:
    'Blue-IQ Hire turns every resume you process into a point at the candidate’s employer. Filter by title, skill, seniority and distance, rank companies by talent in the skills you place, and export client-ready lists. No contact details are ever mapped.',
  alternates: { canonical: '/talent-map' },
};

const FEATURES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'Heat, companies or both',
    body: 'Zoomed out, density shows the pockets. Zoomed in, a bubble per employer site, sized by head count.',
    icon: <><circle cx="10" cy="10" r="3" /><circle cx="10" cy="10" r="6.5" strokeDasharray="2 2" /></>,
  },
  {
    title: 'Filters that match how you search',
    body: 'Title family, skills (any or all), seniority, years of experience, distance from an address, freshness.',
    icon: <path d="M3 5h14M6 10h8M8.5 15h3" />,
  },
  {
    title: 'Company cards',
    body: 'Talent by title family, tech stack, sites, client status, website, careers page and main line.',
    icon: <><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M6 8h8M6 11h5" /></>,
  },
  {
    title: 'Sales mode',
    body: 'Companies ranked by talent in the skills you place, coloured by client status, with a prospect list.',
    icon: <path d="M4 16h3v-5H4v5Zm5 0h3V7H9v9Zm5 0h3V4h-3v12Z" />,
  },
  {
    title: 'Client-ready exports',
    body: 'Excel or CSV with company, industry, counts, status and contact lines. Map image as PNG.',
    icon: <><path d="M10 3.5v9m0 0-3-3m3 3 3-3" /><path d="M3.5 12v3A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5v-3" /></>,
  },
  {
    title: 'Private by design',
    body: 'No names, emails, phones or home addresses. Groups under five are hidden. Your organisation only.',
    icon: <><path d="M10 2.5 16 5v4.5c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V5l6-2.5Z" /><path d="m7.3 10 1.9 1.9 3.6-3.9" /></>,
  },
];

export default function TalentMapPage() {
  return (
    <MarketingPage trail={[{ name: 'Home', path: '/' }, { name: 'Talent heat map', path: '/talent-map' }]}>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/talent-map', label: 'Talent heat map' }]}
        title="Know where the talent works."
        lede="Every resume you process becomes a point at the candidate’s employer. See the pockets, rank the companies, and open the people behind them."
        actions={
          <>
            <ButtonLink href="/talent" size="lg">Open the heat map</ButtonLink>
            <ButtonLink href="#modes" size="lg" variant="secondary">See both modes</ButtonLink>
          </>
        }
      />

      <section className="bg-white pb-8 pt-4">
        <div className="relative mx-auto max-w-[1160px] px-3 sm:px-5">
          <div className="absolute inset-x-10 -bottom-6 top-16 rounded-[40px] bg-[radial-gradient(closest-side,rgba(42,69,216,0.2),rgba(180,35,122,0.07)_60%,transparent)] blur-2xl" aria-hidden />
          <div className="relative -mt-2"><SampleMap /></div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading title="Everything on one screen." />
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <li key={f.title}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-tc-azure/10 text-tc-azure">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {f.icon}
                  </svg>
                </span>
                <h3 className="mt-4 text-[17px] font-semibold text-tc-ink">{f.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.55] text-tc-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="modes" className="scroll-mt-24 border-y border-tc-line bg-tc-desk py-24 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-5">
          <HeatModes
            recruiting={<SampleMap animate={false} />}
            sales={<CompanyBars />}
          />
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
          <SectionHeading
            title="Where the points come from."
            lede="The map fills itself from the work you already do."
          />
          <ol className="grid gap-6 sm:grid-cols-3">
            {[
              ['Every upload', 'Each resume you format is added the moment it is read.'],
              ['Batch backfill', 'Add the resumes you already hold, as many as you like, in one go.'],
              ['Counted once', 'The same person uploaded twice is recognised and counted once.'],
            ].map(([t, s], i) => (
              <li key={t} className="rounded-2xl border border-tc-line p-6">
                <span className="text-[13px] font-semibold tabular-nums text-tc-azure">0{i + 1}</span>
                <p className="mt-3 text-[17px] font-semibold text-tc-ink">{t}</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.55] text-tc-muted">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="border-t border-tc-line">
        <Related links={[navTileFor('matching'), navTileFor('formatting'), navTileFor('security')]} />
      </div>
    </MarketingPage>
  );
}
