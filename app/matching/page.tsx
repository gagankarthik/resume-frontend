import type { Metadata } from 'next';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import SectionHeading from '@/components/landing/SectionHeading';
import FitRadar from '@/components/landing/illustrations/FitRadar';
import { RADAR_CANDIDATES } from '@/lib/site/content';
import Related from '@/components/landing/Related';
import { navTileFor } from '@/components/landing/related-links';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Job matching: rank resumes against a job description',
  description:
    'Paste a job posting and Blue-IQ Hire scores every resume in your set from 0 to 100, with the skills that matched, the ones missing, and a line saying why. Only your account’s resumes are searched.',
  alternates: { canonical: '/matching' },
};

const POINTS = [
  {
    title: 'Ranked best first',
    body: 'Every resume in your set gets a fit score from 0 to 100, and the list comes back best first.',
    icon: <path d="M4 16h3v-5H4v5Zm6.5 0h3V7h-3v9Zm6.5 0h3V4h-3v12Z" />,
  },
  {
    title: 'The reasons, not just a number',
    body: 'Each candidate comes back with the skills that matched, the ones missing, and a line saying why, so a shortlist can be defended.',
    icon: (
      <>
        <path d="M4 6h9M4 10h7M4 14h5" />
        <path d="m13.5 13.5 2 2 4-4.5" />
      </>
    ),
  },
  {
    title: 'Your resumes and nobody else’s',
    body: 'Only the resumes uploaded from your account are searched. There is no shared pool and no other company’s candidates in the results.',
    icon: (
      <>
        <rect x="5" y="9" width="12" height="9" rx="2" />
        <path d="M8 9V6.5a3 3 0 0 1 6 0V9" />
      </>
    ),
  },
];

const FLOW = [
  {
    title: 'Paste the posting',
    body: 'Drop in the job description as you received it. The role, requirements and skills are picked out for you.',
  },
  {
    title: 'Get the ranking',
    body: 'Every resume in your account comes back scored against the opening, strongest fits first.',
  },
  {
    title: 'Send the shortlist',
    body: 'Each candidate shows the skills that matched and the ones missing, so you can explain the pick to the client.',
  },
];

const TOP = RADAR_CANDIDATES.slice(0, 3);

export default function MatchingPage() {
  return (
    <MarketingPage trail={[{ name: 'Home', path: '/' }, { name: 'Job matching', path: '/matching' }]}>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/matching', label: 'Job matching' }]}
        title="Paste the job. Get the shortlist, ranked."
        lede="The resumes you format are already in Blue-IQ Hire. Paste a posting and every one comes back scored against it, without keyword filters to tune or a spreadsheet to keep."
        actions={
          <ButtonLink href="/match" size="lg">
            Match resumes to a job
          </ButtonLink>
        }
      />

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <SectionHeading
              title="Closer to the centre, closer to the job."
              lede="Every resume gets a place relative to the posting. The strong fits sit in the inner ring, and each one can say why it is there."
            />
            <dl className="mt-10 space-y-8">
              {POINTS.map(p => (
                <div key={p.title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-tc-desk text-tc-azure">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {p.icon}
                    </svg>
                  </span>
                  <div>
                    <dt className="text-[16.5px] font-semibold text-tc-ink">{p.title}</dt>
                    <dd className="mt-1.5 text-[15px] leading-[1.6] text-tc-muted">{p.body}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <figure className="rounded-2xl border border-tc-line bg-white p-6 sm:p-8">
            <FitRadar />
            <figcaption className="mt-6 border-t border-tc-line pt-5">
              <p className="text-[13.5px] text-tc-muted">
                An example set of seven resumes against a Senior Data Engineer posting.
              </p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {TOP.map((c, i) => (
                  <li key={c.initials} className="flex items-baseline gap-2 text-[14px]">
                    <span className="font-semibold tabular-nums text-tc-faint">{i + 1}</span>
                    <span className="font-medium text-tc-ink">{c.name}</span>
                    <span className="ml-auto font-semibold tabular-nums text-tc-mint sm:ml-0">{c.score}</span>
                  </li>
                ))}
              </ol>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y border-tc-line bg-tc-desk py-24 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading
            title="From posting to shortlist in three steps."
            lede="No boolean strings, no keyword filters, no spreadsheet."
          />
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {FLOW.map((f, i) => (
              <li key={f.title} className="border-t-2 border-tc-ink pt-6">
                <span className="text-[40px] font-bold leading-none tracking-[-0.04em] text-tc-azure tabular-nums">{i + 1}</span>
                <h3 className="mt-4 text-[18px] font-semibold text-tc-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-tc-muted">{f.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Related links={[navTileFor('formatting'), navTileFor('security'), navTileFor('faq')]} />
    </MarketingPage>
  );
}
