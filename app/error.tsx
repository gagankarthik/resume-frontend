'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TruecopyLogo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { IconAlert } from '@/components/ui/icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[truecopy]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-tc-line">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center px-5">
          <TruecopyLogo />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-xl border border-tc-rose/25 bg-tc-rose/[0.06] text-tc-rose">
            <IconAlert size={22} />
          </span>

          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-tc-ink">
            Something went wrong on this page
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.6] text-tc-muted">
            Your extracted record is untouched. It is stored in this browser, not on
            this page.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={reset}>
              Try again
            </Button>
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-[10px] border border-tc-line-2 px-6 text-[15px] font-medium text-tc-ink transition-colors hover:bg-tc-desk"
            >
              Back to home
            </Link>
          </div>

          {error.digest && (
            <p className="mt-8 font-mono text-[11px] text-tc-faint">
              Reference {error.digest}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
