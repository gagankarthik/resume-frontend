import type { Metadata } from 'next';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import FAQList from '@/components/landing/FAQ';
import Related from '@/components/landing/Related';
import { navTileFor } from '@/components/landing/related-links';
import { FaqData } from '@/components/seo/StructuredData';
import { IconMail } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Questions about resume formatting and matching',
  description:
    'Answers about the files Blue-IQ Hire accepts, whether it rewords anything, how candidate data is stored, exporting to several states, and how job matching picks candidates.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <MarketingPage trail={[{ name: 'Home', path: '/' }, { name: 'Questions', path: '/faq' }]}>
      <FaqData />
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/faq', label: 'Questions' }]}
        title="Before you upload."
        lede="What people ask most about files, fidelity, storage and matching."
      />

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-20">
          <FAQList />
          <aside className="h-fit rounded-2xl border border-tc-line bg-tc-desk p-7">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-tc-azure">
              <IconMail size={22} />
            </span>
            <h2 className="mt-5 text-[18px] font-semibold text-tc-ink">Still have a question?</h2>
            <p className="mt-2 text-[14.5px] leading-[1.6] text-tc-muted">
              Email the team and you’ll hear back from a person, not a ticket queue.
            </p>
            <a
              href="mailto:oceanbluesolutions@gmail.com"
              className="mt-5 inline-block text-[15px] font-semibold text-tc-azure hover:underline"
            >
              Email support
            </a>
          </aside>
        </div>
      </section>

      <div className="border-t border-tc-line">
        <Related links={[navTileFor('formatting'), navTileFor('matching'), navTileFor('security')]} />
      </div>
    </MarketingPage>
  );
}
