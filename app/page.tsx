import SiteNav from '@/components/landing/SiteNav';
import Hero from '@/components/landing/Hero';
import PipelineFlow from '@/components/landing/PipelineFlow';
import FormatGallery from '@/components/landing/FormatGallery';
import CapabilityGrid from '@/components/landing/CapabilityGrid';
import SiteFooter from '@/components/landing/SiteFooter';

export default function Home() {
  return (
    <main className="bg-paper">
      <SiteNav />
      <Hero />
      <PipelineFlow />
      <FormatGallery />
      <CapabilityGrid />
      <SiteFooter />
    </main>
  );
}
