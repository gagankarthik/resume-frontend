'use client';

import Link from 'next/link';
import { useSession } from '@/components/auth/useSession';

/** Visitors see how to begin; signed-in people see the way back into the app. */
export default function FooterAuthLinks({ dark }: { dark: boolean }) {
  const session = useSession();
  const primary = `text-[14px] font-semibold hover:underline ${dark ? 'text-indigo-300' : 'text-tc-azure'}`;
  const secondary = `text-[14px] font-semibold hover:underline ${dark ? 'text-zinc-300' : 'text-tc-ink'}`;

  if (session.state === 'in') {
    return (
      <div className="mt-6">
        <Link href="/talent" className={primary}>Open the app</Link>
      </div>
    );
  }
  return (
    <div className="mt-6 flex items-center gap-3">
      <Link href="/talent" className={primary}>Get started</Link>
      {session.state === 'out' && (
        <>
          <span className={`h-4 w-px ${dark ? 'bg-white/15' : 'bg-tc-line-2'}`} aria-hidden />
          <Link href="/signin" className={secondary}>Sign in</Link>
        </>
      )}
    </div>
  );
}
