import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, authConfigured } from '@/lib/auth/config';
import { verifyIdToken } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Who is signed in. The token itself never leaves the server — only the
 * display claims the UI needs.
 */
export async function GET() {
  if (!authConfigured()) {
    return NextResponse.json({ authenticated: false, configured: false });
  }

  const token = (await cookies()).get(COOKIE.session)?.value;
  if (!token) return NextResponse.json({ authenticated: false, configured: true });

  const user = await verifyIdToken(token);
  if (!user) return NextResponse.json({ authenticated: false, configured: true });

  return NextResponse.json({
    authenticated: true,
    configured: true,
    user: { email: user.email, name: user.name, groups: user.groups },
  });
}
