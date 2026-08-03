'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { HireLogo } from '@/components/brand/Logo';
import UserMenu from '@/components/auth/UserMenu';

/**
 * Shared chrome for the working pages.
 *
 * Three bands: the mark at one end, the account at the other, and the places
 * you can go held in the middle. The centre stays centred whatever a page puts
 * on the right, because the two outer bands are equal-width — so the bar reads
 * the same on every page instead of drifting with the button count.
 */

const NAV = [
  { href: '/upload', label: 'Upload' },
  { href: '/editor', label: 'Review' },
  { href: '/match', label: 'Match' },
] as const;

export default function AppHeader({ children }: { children?: ReactNode }) {
  const pathname = usePathname() ?? '';

  return (
    <header className="sticky top-0 z-30 border-b border-tc-line bg-white">
      {/* Full width on purpose: the mark sits at one edge, the account at the
          other, and the links hold the middle of the screen. */}
      <div className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        {/* The logo links home on its own — do not wrap it in another link. */}
        <div className="justify-self-start">
          <HireLogo size={28} />
        </div>

        {/* Plain links, not buttons — this is navigation between places, and it
            should not compete with the tabs a page puts under it. */}
        <nav aria-label="Main" className="hidden items-center gap-7 sm:flex">
          {NAV.map(item => {
            const current = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`text-[14px] transition-colors ${
                  current ? 'font-semibold text-tc-ink' : 'font-medium text-tc-muted hover:text-tc-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Keeps the centre band occupied on phones, where the nav is hidden. */}
        <span className="sm:hidden" aria-hidden />

        <div className="flex items-center gap-2 justify-self-end">
          {children}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
