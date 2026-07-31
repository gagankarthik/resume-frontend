'use client';

import type { ReactNode } from 'react';
import { TruecopyLogo } from '@/components/brand/Logo';
import UserMenu from '@/components/auth/UserMenu';

const STEPS = ['Upload', 'Review', 'Export'] as const;
export type AppStep = (typeof STEPS)[number];

/**
 * Shared chrome for the working pages. Same type, same rules, same buttons
 * as the marketing site — the product should not change identity at the door.
 */
export default function AppHeader({
  step,
  children,
  dense = false,
}: {
  step: AppStep;
  children?: ReactNode;
  dense?: boolean;
}) {
  const current = STEPS.indexOf(step);

  return (
    <header className="z-30 shrink-0 border-b border-tc-line bg-white">
      <div
        className={`mx-auto flex items-center gap-4 px-4 sm:px-5 ${
          dense ? 'h-14' : 'h-16 max-w-[1140px]'
        }`}
      >
        <TruecopyLogo size={28} />

        <span className="hidden h-5 w-px bg-tc-line sm:block" aria-hidden />

        {/* Where you are */}
        <ol className="hidden items-center gap-1.5 sm:flex">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="text-tc-line-2">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] font-medium ${
                  i === current
                    ? 'bg-tc-desk text-tc-ink'
                    : i < current
                      ? 'text-tc-mint'
                      : 'text-tc-faint'
                }`}
                aria-current={i === current ? 'step' : undefined}
              >
                {i < current ? (
                  <svg width="11" height="11" viewBox="0 0 8 8" fill="none" aria-hidden>
                    <path d="M1 4.2 3 6.2 7 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold ${
                      i === current ? 'bg-tc-azure text-white' : 'bg-tc-desk-2 text-tc-faint'
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
                {s}
              </span>
            </li>
          ))}
        </ol>

        <div className="ml-auto flex items-center gap-2">
          {children}
          <span className="hidden h-5 w-px bg-tc-line sm:block" aria-hidden />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
