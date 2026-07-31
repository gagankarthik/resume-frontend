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
 * Gate a route handler. A route answers with 401 rather than a redirect, since
 * the caller is fetch. Open deployments (no pool configured) pass, matching the
 * page-level gate.
 *
 * `owner` is the caller's stable Cognito id — it tags what they store in the
 * matching engine so a search can be narrowed to one person's own uploads.
 * There is no id to tag with when the app runs open, and none is invented.
 */
export async function apiSession(): Promise<{ ok: boolean; owner: string | null }> {
  if (!authConfigured()) return { ok: true, owner: null };
  const user = await getSessionUser();
  return user ? { ok: true, owner: user.sub } : { ok: false, owner: null };
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
