import type { Metadata } from 'next';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import SectionHeading from '@/components/landing/SectionHeading';
import FidelityGrid from '@/components/landing/FidelityGrid';
import TemplateCards from '@/components/landing/TemplateCards';
import Related from '@/components/landing/Related';
import { navTileFor } from '@/components/landing/related-links';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Resume formatting for state submittals',
  description:
    'Convert a resume from PDF, Word or text into the Ohio, Pennsylvania, Georgia or Oceanblue Word template. Every bullet is copied word for word and checked against the original before export.',
  alternates: { canonical: '/formatting' },
};

const SECTIONS = [
  'Contact details',
  'Professional summary',
  'Objective',
  'Summary subsections',
  'Technical skills',
  'Skill categories',
  'Programming languages',
  'Work experience',
  'Responsibilities',
  'Key technologies per role',
  'Role projects',
  'Projects',
  'Education',
  'Certifications',
  'Patents',
  'Conferences and talks',
  'Courses',
  'Training',
  'Volunteer experience',
  'Extracurricular activities',
  'References',
];

export default function FormattingPage() {
  return (
    <MarketingPage trail={[{ name: 'Home', path: '/' }, { name: 'Resume formatting', path: '/formatting' }]}>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/formatting', label: 'Resume formatting' }]}
        title="The candidate’s words, in the agency’s format."
        lede="Upload a resume in whatever layout it arrived in. Blue-IQ Hire pulls every section into a record, checks the record against the file, and sets it into the template the requisition calls for."
        actions={
          <ButtonLink href="/talent" size="lg">
            Get started
          </ButtonLink>
        }
      />

      <FidelityGrid />

      {/* What comes out */}
      <section className="border-y border-tc-line bg-tc-desk py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
          <SectionHeading
            title="Twenty-one sections, each in its own field."
            lede="Anything the candidate wrote has somewhere to go, so nothing is dropped because a template had no place for it."
          />
          <ul className="grid content-start gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map(s => (
              <li key={s} className="flex items-center gap-3 border-b border-tc-line py-3.5 text-[15px] text-tc-ink">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-tc-mint" aria-hidden>
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="m5.3 8.2 1.8 1.8 3.6-3.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionHeading
            title="Four templates from one record."
            lede="Review once, then export as many times as you need. Each template has its own page with the full section order."
          />
          <div className="mt-12">
            <TemplateCards />
          </div>
        </div>
      </section>

      <div className="border-t border-tc-line">
        <Related
          links={[
            navTileFor('how'),
            navTileFor('matching'),
            navTileFor('security'),
          ]}
        />
      </div>
    </MarketingPage>
  );
}
