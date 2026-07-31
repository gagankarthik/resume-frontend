import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE, authConfigured } from './config';
import { verifyIdToken, type SessionUser } from './session';

/**
 * Read the signed-in user, if there is one.
 *
 * This is the security boundary — the ID token's signature is checked against
 * the pool's JWKS on every call, so a forged or expired cookie is simply no
 * session. Server components and route handlers call this directly; there is
 * no middleware in front of it.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(COOKIE.session)?.value;
  if (!token) return null;
  return verifyIdToken(token);
}

/**
 * Gate a server component. Sends the browser to the hosted UI and back to
 * where it was heading. When Cognito is not configured the app runs open, so
 * local development and self-hosted installs are not bricked by a missing pool.
 */
export async function requireSession(next: string): Promise<SessionUser | null> {
  if (!authConfigured()) return null;
  const user = await getSessionUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return user;
}
