import type { Metadata } from 'next';
import OpenAccessNotice from '@/components/app/OpenAccessNotice';
import { requireSession } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Talent map',
  robots: { index: false, follow: false },
};

/** Server-side gate. Nothing under /talent renders without a verified session. */
export default async function TalentLayout({ children }: { children: React.ReactNode }) {
  await requireSession('/talent');
  return (
    <>
      <OpenAccessNotice />
      {children}
    </>
  );
}
