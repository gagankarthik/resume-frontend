import type { ReactNode } from 'react';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import CtaBand from './CtaBand';
import StructuredData, { BreadcrumbData } from '@/components/seo/StructuredData';

/** Nav, content, closing band and footer — the frame every marketing page shares. */
export default function MarketingPage({
  children,
  trail,
  cta = true,
  tone = 'light',
}: {
  children: ReactNode;
  /** Breadcrumb trail for structured data, home first. */
  trail?: { name: string; path: string }[];
  cta?: boolean;
  /** The home page runs dark end to end; every other page is light. */
  tone?: 'light' | 'dark';
}) {
  return (
    <>
      <StructuredData />
      {trail && <BreadcrumbData trail={trail} />}
      <SiteNav tone={tone} />
      <main id="main" className={tone === 'dark' ? 'bg-zinc-950' : undefined}>{children}</main>
      {cta && <CtaBand tone={tone} />}
      <SiteFooter tone={tone} />
    </>
  );
}
