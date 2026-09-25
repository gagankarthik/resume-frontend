'use client';

import Link from 'next/link';
import { useSession } from '@/components/auth/useSession';

/** The primary action: sign-up language for visitors, the way in for signed-in people. */
export default function SessionCta({ className = '' }: { className?: string }) {
  const session = useSession();
  const signedIn = session.state === 'in';
  return (
    <Link
      href="/talent"
      className={`inline-flex h-11 items-center gap-2 rounded-full bg-zinc-950 px-6 text-[14.5px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(9,9,11,0.6)] transition-transform hover:-translate-y-0.5 ${className}`}
    >
      {signedIn ? 'Open your talent map' : 'Get started'}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
