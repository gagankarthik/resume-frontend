import type { Metadata } from 'next';
import SiteNav from '@/components/landing/SiteNav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import FormatGallery from '@/components/landing/FormatGallery';
import MatchSection from '@/components/landing/MatchSection';
import FidelityGrid from '@/components/landing/FidelityGrid';
import FAQ from '@/components/landing/FAQ';
import SiteFooter from '@/components/landing/SiteFooter';
import StructuredData from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Truecopy: resumes set to the format the state requires',
  description:
    'Upload a resume in PDF, Word, or text. Truecopy extracts every section word for word, checks it against the original, and writes a submission-ready Word document in the Ohio, Pennsylvania, Georgia, or Oceanblue template. Paste a job description to rank your resumes against it, with the matched and missing skills behind every score.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <StructuredData />
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <FormatGallery />
        <MatchSection />
        <FidelityGrid />
        <FAQ />
      </main>
      <SiteFooter />
    </>
  );
}
