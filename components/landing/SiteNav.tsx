'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { HireLogo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import UserMenu from '@/components/auth/UserMenu';
import { useSession } from '@/components/auth/useSession';
import { NAV, type NavGroup, type NavItem } from './nav-data';

/**
 * Marketing navigation.
 *
 * Sits transparent over each page's dark opening band, and turns to paper
 * once the page scrolls or a menu opens. Menus open on hover for a pointer
 * and on click or Enter for everyone; Escape and a click outside close them.
 */

function ItemLink({ item, onPick }: { item: NavItem; onPick: () => void }) {
  const inner = (
    <>
      {item.icon}
      <span className="min-w-0">
        <span className="block text-[14.5px] font-semibold text-tc-ink">{item.title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-tc-muted">{item.body}</span>
      </span>
    </>
  );
  const cls = 'group flex items-start gap-3.5 rounded-lg p-3 transition-colors hover:bg-tc-desk focus-visible:bg-tc-desk';
  return item.href.startsWith('mailto:') ? (
    <a href={item.href} className={cls} onClick={onPick}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={cls} onClick={onPick}>
      {inner}
    </Link>
  );
}

function Panel({ group, onPick }: { group: NavGroup; onPick: () => void }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-tc-line bg-white shadow-[0_24px_60px_-20px_rgba(12,27,51,0.35)] ${
        group.wide ? 'w-[600px]' : 'w-[380px]'
      }`}
    >
      <div className={`grid gap-1 p-2 ${group.wide ? 'grid-cols-2' : ''}`}>
        {group.items.map(item => (
          <ItemLink key={item.href} item={item} onPick={onPick} />
        ))}
      </div>
      {group.footer && (
        <Link
          href={group.footer.href}
          onClick={onPick}
          className="flex items-center justify-between border-t border-tc-line bg-tc-desk px-5 py-3.5 text-[13.5px] font-semibold text-tc-ink transition-colors hover:text-tc-azure"
        >
          {group.footer.label}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SiteNav({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const session = useSession();
  // Signed-in people are already customers: no sign-up prompt, just the way in.
  const signedIn = session.state === 'in';
  const [section, setSection] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A new page closes whatever was open on the last one.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(null);
    setMobile(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(null);
    const onDown = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [menu]);

  const hover = (label: string | null) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMenu(label), label ? 60 : 160);
  };

  // The bar takes the tone of the page it sits on; scrolling adds the hairline
  // and blur. The mobile sheet is always light, so the bar joins it when open.
  const light = tone === 'light' || mobile;
  const raised = scrolled || menu !== null || mobile;
  const close = () => { setMenu(null); setMobile(false); };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        ref={bar}
        className={`border-b transition-[background-color,border-color] duration-200 ${
          !raised
            ? 'border-transparent bg-transparent'
            : light
              ? 'border-tc-line bg-white/90 backdrop-blur-xl'
              : 'border-white/[0.08] bg-zinc-950/75 backdrop-blur-xl'
        }`}
        onMouseLeave={() => hover(null)}
      >
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-6 px-5">
          <HireLogo tone={light ? 'light' : 'dark'} />

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map(group => {
              const open = menu === group.label;
              const id = `menu-${group.label.toLowerCase()}`;
              return (
                <div key={group.label} className="relative" onMouseEnter={() => hover(group.label)}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={id}
                    onClick={() => setMenu(open ? null : group.label)}
                    className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[14.5px] font-medium transition-colors ${
                      light
                        ? open ? 'text-tc-ink' : 'text-tc-muted hover:text-tc-ink'
                        : open ? 'text-white' : 'text-white/75 hover:text-white'
                    }`}
                  >
                    {group.label}
                    <Chevron open={open} />
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        id={id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute left-1/2 top-full -translate-x-1/2 pt-3"
                      >
                        <Panel group={group} onPick={close} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className={`hidden sm:block ${light ? '' : '[&>a]:!text-zinc-300 [&>a:hover]:!bg-white/[0.06] [&>a:hover]:!text-white [&>div>button]:ring-1 [&>div>button]:ring-white/20'}`}>
              <UserMenu />
            </div>
            <ButtonLink
              href="/talent"
              size="sm"
              className={`hidden whitespace-nowrap rounded-full px-4 sm:inline-flex ${
                light ? '!bg-zinc-950 hover:!bg-zinc-800' : '!bg-white !text-zinc-950 hover:!bg-zinc-200'
              }`}
            >
              {signedIn ? 'Open app' : 'Get started'}
            </ButtonLink>
            <button
              onClick={() => { setMobile(o => !o); setMenu(null); }}
              aria-label={mobile ? 'Close menu' : 'Open menu'}
              aria-expanded={mobile}
              className={`grid h-10 w-10 place-items-center rounded-md border lg:hidden ${
                light ? 'border-tc-line bg-white text-tc-ink' : 'border-white/20 text-white'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                {mobile ? (
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <path d="M2.5 5h11M2.5 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Phone and tablet: one sheet, groups fold open */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="h-[calc(100dvh-68px)] overflow-y-auto bg-white lg:hidden"
          >
            <nav aria-label="Main" className="mx-auto max-w-[640px] px-5 pb-10 pt-2">
              {NAV.map(group => {
                const open = section === group.label;
                return (
                  <div key={group.label} className="border-b border-tc-line">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setSection(open ? null : group.label)}
                      className="flex w-full items-center justify-between py-4 text-[17px] font-semibold text-tc-ink"
                    >
                      {group.label}
                      <Chevron open={open} />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="-mx-3 pb-3">
                            {group.items.map(item => (
                              <ItemLink key={item.href} item={item} onPick={close} />
                            ))}
                            {group.footer && (
                              <Link
                                href={group.footer.href}
                                onClick={close}
                                className="mx-3 mt-1 block py-2 text-[14px] font-semibold text-tc-azure"
                              >
                                {group.footer.label}
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <div className="mt-6 grid gap-3">
                <ButtonLink href="/talent" size="lg" onClick={close}>
                  {signedIn ? 'Open app' : 'Get started'}
                </ButtonLink>
                <ButtonLink href="/talent-map" size="lg" variant="secondary" onClick={close}>
                  Explore the heat map
                </ButtonLink>
                <div className="flex justify-center pt-2">
                  <UserMenu />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
