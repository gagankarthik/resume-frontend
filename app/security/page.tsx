import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import SectionHeading from '@/components/landing/SectionHeading';
import { DataPath, SecurityFacts } from '@/components/landing/Security';
import Related from '@/components/landing/Related';
import { navTileFor } from '@/components/landing/related-links';

export const metadata: Metadata = {
  title: 'Security and candidate data handling',
  description:
    'How Blue-IQ Hire handles resumes: files are read in memory and never written to disk, the full record stays in your browser, the talent map keeps no contact details, and matching only searches your own account.',
  alternates: { canonical: '/security' },
};

const DOCS = [
  { href: '/legal/security', title: 'Security overview', body: 'The controls in place, in full.' },
  { href: '/legal/data-processing', title: 'Data processing terms', body: 'What is processed, why, and for how long.' },
  { href: '/legal/privacy', title: 'Privacy policy', body: 'What we collect about you as a user.' },
  { href: '/legal/cookies', title: 'Cookies', body: 'The few cookies the site sets, and why.' },
];

export default function SecurityPage() {
  return (
    <MarketingPage trail={[{ name: 'Home', path: '/' }, { name: 'Security', path: '/security' }]}>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/security', label: 'Security' }]}
        title="Candidate data goes where you can see it."
        lede="Resumes carry home addresses, phone numbers and work history. The path they take through Blue-IQ Hire is short, and every step of it is written down."
      />

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <SectionHeading
              title="The trip a resume takes."
              lede="Up to the extraction service, read in memory, and back to your browser as a record. That is the whole journey."
            />
            <div className="mt-10">
              <SecurityFacts />
            </div>
          </div>
          <div className="rounded-2xl border border-tc-line bg-tc-desk p-6 sm:p-10">
            <DataPath />
          </div>
        </div>
      </section>

      <section className="border-y border-tc-line bg-tc-desk py-24 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading title="The documents behind it." lede="For your compliance team, the full terms." />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-tc-line bg-tc-line sm:grid-cols-2 lg:grid-cols-4">
            {DOCS.map(d => (
              <li key={d.href} className="bg-white">
                <Link href={d.href} className="block h-full p-6 transition-colors hover:bg-tc-desk">
                  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="var(--color-tc-azure)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5.5 2.5h6l3.5 3.5v10a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 16V4a1.5 1.5 0 0 1 1.5-1.5Z" />
                    <path d="M11.5 2.5V6H15M7 10h6M7 13h4" />
                  </svg>
                  <span className="mt-4 block text-[16px] font-semibold text-tc-ink">{d.title}</span>
                  <span className="mt-1 block text-[14px] leading-[1.55] text-tc-muted">{d.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Related links={[navTileFor('matching'), navTileFor('how'), navTileFor('faq')]} />
    </MarketingPage>
  );
}
