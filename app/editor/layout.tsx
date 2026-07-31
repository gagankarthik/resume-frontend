import { requireSession } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

/** Server-side gate. Nothing under /editor renders without a verified session. */
export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  await requireSession('/editor');
  return children;
}
