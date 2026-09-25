import type { Metadata } from 'next';
import MarketingPage from '@/components/landing/MarketingPage';
import Hero from '@/components/landing/home/Hero';
import { Bento, Facts, SectionTitle, Steps } from '@/components/landing/home/Sections';
import SkillOrbit from '@/components/landing/home/SkillOrbit';
import HeatModes from '@/components/landing/HeatModes';
import UsHeatMap from '@/components/landing/product/UsHeatMap';
import { CompanyBars } from '@/components/landing/product/SampleCharts';

export const metadata: Metadata = {
  title: { absolute: 'Blue-IQ Hire: resume formatting, job matching and talent heat maps for staffing teams' },
  description:
    'Format resumes to the Ohio, Pennsylvania, Georgia or Oceanblue template word for word, rank your resumes against a job description, and see on a heat map which employers and metros hold the talent you place.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <MarketingPage>
      <Hero />
      <SkillOrbit />
      <Bento />
      <Facts />
      <Steps />

      <section className="border-t border-zinc-100 bg-zinc-50/60 py-28">
        <div className="mx-auto max-w-[1200px] px-5">
          <SectionTitle
            kicker="Talent heat map"
            title="Built for recruiters and for sales."
            lede="The same map answers two questions: where the talent is, and which companies to call."
          />
          <div className="mt-14">
            <HeatModes
              recruiting={
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_48px_-32px_rgba(9,9,11,0.35)]" style={{ aspectRatio: '975 / 610' }}>
                  <UsHeatMap tone="vivid" animate={false} />
                </div>
              }
              sales={<CompanyBars />}
            />
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
