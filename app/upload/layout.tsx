import { requireSession } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

/** Server-side gate. Nothing under /upload renders without a verified session. */
export default async function UploadLayout({ children }: { children: React.ReactNode }) {
  await requireSession('/upload');
  return children;
}
