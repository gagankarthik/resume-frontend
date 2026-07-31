import { requireSession } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

/** Server-side gate. Nothing under /match renders without a verified session. */
export default async function MatchLayout({ children }: { children: React.ReactNode }) {
  await requireSession('/match');
  return children;
}
