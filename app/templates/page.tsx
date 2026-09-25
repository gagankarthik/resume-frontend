import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import SectionHeading from '@/components/landing/SectionHeading';
import TemplateCards from '@/components/landing/TemplateCards';
import Related from '@/components/landing/Related';
import { navTileFor } from '@/components/landing/related-links';
import { Emblem } from '@/components/landing/illustrations/Emblems';
import { TEMPLATE_PAGES } from '@/lib/site/content';

export const metadata: Metadata = {
  title: 'State resume templates: Ohio, Pennsylvania, Georgia and Oceanblue',
  description:
    'Compare the four Word templates Blue-IQ Hire exports: the Ohio VectorVMS and Pennsylvania PeopleFluent submission forms, the Georgia direct-submittal resume, and the Oceanblue letterhead format.',
  alternates: { canonical: '/templates' },
};

export default function TemplatesPage() {
  return (
    <MarketingPage trail={[{ name: 'Home', path: '/' }, { name: 'Templates', path: '/templates' }]}>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/templates', label: 'Templates' }]}
        title="Four templates, set to the letter."
        lede="Each export follows its agency’s section order, tables and type, so the reviewer finds everything where they expect it."
      />

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-5">
          <TemplateCards />
        </div>
      </section>

      {/* Which one */}
      <section className="border-y border-tc-line bg-tc-desk py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
          <SectionHeading
            title="Which one to use."
            lede="Use the template the requisition names. If it names a system rather than a state, this is where it goes."
          />
          <div className="overflow-hidden rounded-xl border border-tc-line bg-white">
            <table className="w-full text-left text-[15px]">
              <caption className="sr-only">Template to use for each submission route</caption>
              <thead className="border-b border-tc-line bg-tc-desk/60 text-[13.5px] text-tc-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-medium">The opening comes through</th>
                  <th scope="col" className="px-5 py-3.5 font-medium">Export as</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tc-line">
                {TEMPLATE_PAGES.map(t => (
                  <tr key={t.id}>
                    <td className="px-5 py-4 text-tc-ink">{t.submittedThrough}</td>
                    <td className="px-5 py-4">
                      <Link href={`/templates/${t.slug}`} className="inline-flex items-center gap-3 font-semibold text-tc-ink hover:text-tc-azure">
                        <Emblem id={t.id} size={32} />
                        {t.name}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Related links={[navTileFor('formatting'), navTileFor('how'), navTileFor('faq')]} />
    </MarketingPage>
  );
}
