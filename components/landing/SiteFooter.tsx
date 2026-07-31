'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TruecopyLogo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { IconArrowRight } from '@/components/ui/icons';

const YEAR = new Date().getFullYear();

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { href: '#how', label: 'How it works' },
      { href: '#templates', label: 'Templates' },
      { href: '#controls', label: 'Controls' },
      { href: '#faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Use it',
    links: [
      { href: '/upload', label: 'Upload a resume' },
      { href: '/editor', label: 'Open the editor' },
      { href: '/signin', label: 'Sign in' },
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
  {
    heading: 'Company',
    links: [
      { href: '/legal/security', label: 'Security' },
      { href: 'mailto:oceanbluesolutions@gmail.com', label: 'Contact support' },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const cls = 'text-[13.5px] text-tc-muted transition-colors hover:text-tc-ink';
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('/api/')) {
    return (
      <a href={href} className={cls}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-tc-line bg-white">
      {/* Closing call to action */}
      <div className="mx-auto max-w-[1140px] px-5 py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-tc-ink px-8 py-14 text-center sm:px-12"
        >
          <h2 className="mx-auto max-w-lg text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-[38px]">
            Put a resume through it.
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-[15.5px] leading-[1.6] text-white/55">
            One upload, a short review, a document that matches the template.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink
              href="/upload"
              size="lg"
              variant="secondary"
              className="border-transparent bg-white text-tc-ink hover:bg-tc-desk"
            >
              Upload a resume
              <IconArrowRight size={15} />
            </ButtonLink>
            <Link
              href="/editor"
              className="inline-flex h-12 items-center rounded-[10px] border border-white/20 px-6 text-[15px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              Open the editor
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Sitemap */}
      <div className="border-t border-tc-line">
        <div className="mx-auto grid max-w-[1140px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          <div>
            <TruecopyLogo />
            <p className="mt-4 max-w-[24ch] text-[13.5px] leading-relaxed text-tc-muted">
              Resume conversion for state workforce submittals. Read the file, check the
              copy, set it to the template.
            </p>
            <p className="mt-5 text-[12.5px] text-tc-faint">
              A product of Oceanblue Solutions
            </p>
          </div>

          {COLUMNS.map(col => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-tc-ink">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(l => (
                  <li key={l.href}>
                    <FooterLink {...l} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-tc-line">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-tc-faint">
            © {YEAR} Oceanblue Solutions. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-tc-faint">
            <Link href="/legal/privacy" className="transition-colors hover:text-tc-ink">
              Privacy
            </Link>
            <Link href="/legal/terms" className="transition-colors hover:text-tc-ink">
              Terms
            </Link>
            <Link href="/legal/cookies" className="transition-colors hover:text-tc-ink">
              Cookies
            </Link>
            <span className="hidden sm:inline">Files are not stored on our servers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
