import Link from 'next/link';
import { HireLogo } from '../brand/Logo';
import FooterAuthLinks from './FooterAuthLinks';
import { TEMPLATE_PAGES } from '@/lib/site/content';

const YEAR = new Date().getFullYear();

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { href: '/formatting', label: 'Resume formatting' },
      { href: '/matching', label: 'Job matching' },
      { href: '/talent-map', label: 'Talent heat map' },
      { href: '/how-it-works', label: 'How it works' },
    ],
  },
  {
    heading: 'Templates',
    links: [
      ...TEMPLATE_PAGES.map(t => ({ href: `/templates/${t.slug}`, label: t.name })),
      { href: '/templates', label: 'Compare templates' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/security', label: 'Security' },
      { href: '/faq', label: 'Questions' },
      { href: 'mailto:oceanbluesolutions@gmail.com', label: 'Contact support' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/terms', label: 'Terms of service' },
      { href: '/legal/data-processing', label: 'Data processing' },
      { href: '/legal/accessibility', label: 'Accessibility' },
    ],
  },
];

function FooterLink({ href, label, dark }: { href: string; label: string; dark: boolean }) {
  const cls = `text-[14px] transition-colors ${dark ? 'text-zinc-500 hover:text-white' : 'text-tc-muted hover:text-tc-ink'}`;
  if (href.startsWith('mailto:')) {
    return <a href={href} className={cls}>{label}</a>;
  }
  return <Link href={href} className={cls}>{label}</Link>;
}

export default function SiteFooter({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  return (
    <footer className={dark ? 'border-t border-white/[0.06] bg-zinc-950' : 'border-t border-tc-line bg-tc-desk'}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
        <div>
          <HireLogo tone={dark ? 'dark' : 'light'} />
          <p className={`mt-5 max-w-[28ch] text-[14px] leading-relaxed ${dark ? 'text-zinc-500' : 'text-tc-muted'}`}>
            Resume formatting, job matching and talent heat maps for staffing teams.
          </p>
          <FooterAuthLinks dark={dark} />
        </div>

        {COLUMNS.map(col => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className={`text-[14px] font-semibold ${dark ? 'text-white' : 'text-tc-ink'}`}>{col.heading}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map(l => (
                <li key={l.href}>
                  <FooterLink {...l} dark={dark} />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={dark ? 'border-t border-white/[0.06]' : 'border-t border-tc-line'}>
        <div className={`mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-6 text-[13px] sm:flex-row sm:items-center sm:justify-between ${dark ? 'text-zinc-600' : 'text-tc-faint'}`}>
          <p>© {YEAR} Oceanblue Solutions. All rights reserved.</p>
          <p>Blue-IQ Hire is a product of Oceanblue Solutions.</p>
        </div>
      </div>
    </footer>
  );
}
