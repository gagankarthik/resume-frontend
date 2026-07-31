'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TruecopyLogo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import UserMenu from '@/components/auth/UserMenu';

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#templates', label: 'Templates' },
  { href: '#controls', label: 'Controls' },
  { href: '#faq', label: 'FAQ' },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`border-b transition-colors duration-200 ${
          scrolled ? 'border-tc-line bg-white/85 backdrop-blur-xl' : 'border-transparent bg-white'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-5">
          <TruecopyLogo />

          <nav className="hidden items-center gap-0.5 md:flex">
            {LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-tc-muted transition-colors hover:bg-tc-desk hover:text-tc-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <UserMenu />
            <ButtonLink href="/upload" size="sm" className="px-4">
              Upload a resume
            </ButtonLink>
            <button
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-lg border border-tc-line text-tc-muted md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                {open ? (
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M2.5 5h11M2.5 11h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="border-b border-tc-line bg-white md:hidden"
          >
            <nav className="mx-auto flex max-w-[1140px] flex-col px-5 py-2">
              {LINKS.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-tc-line py-3.5 text-[15px] font-medium text-tc-ink last:border-0"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
