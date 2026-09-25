import type { Metadata } from 'next';
import MarketingPage from '@/components/landing/MarketingPage';
import PageHero from '@/components/landing/PageHero';
import { StepsDetailed } from '@/components/landing/HowItWorks';
import Related from '@/components/landing/Related';
import { navTileFor } from '@/components/landing/related-links';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'How it works: five passes from upload to submittal',
  description:
    'Every resume uploaded to Blue-IQ Hire is read, extracted, checked against the source, reviewed by you and exported to a state template, in that order.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksPage() {
  return (
    <MarketingPage trail={[{ name: 'Home', path: '/' }, { name: 'How it works', path: '/how-it-works' }]}>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/how-it-works', label: 'How it works' }]}
        title="Five passes over every document."
        lede="The same steps run on every upload, in the same order. Each one hands the next something it can check, and you see the result before anything is exported."
        actions={
          <ButtonLink href="/talent" size="lg">
            Get started
          </ButtonLink>
        }
      />

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto max-w-[1000px] px-5">
          <StepsDetailed />
        </div>
      </section>

      <div className="border-t border-tc-line">
        <Related links={[navTileFor('formatting'), navTileFor('templates'), navTileFor('security')]} />
      </div>
    </MarketingPage>
  );
}
