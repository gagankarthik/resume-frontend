import { NextResponse } from 'next/server';
import { COOKIE, authConfigured, cognitoConfig, originFrom, secureCookies } from '@/lib/auth/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function randomString(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function challengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

/**
 * Start the hosted-UI sign-in with Authorization Code + PKCE.
 * The verifier and state never reach the browser's JavaScript — they go out as
 * httpOnly cookies and come back on the callback.
 */
export async function GET(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: 'Sign-in is not configured on this deployment.' },
      { status: 503 },
    );
  }

  const cfg = cognitoConfig();
  const origin = originFrom(req);
  const requested = new URL(req.url).searchParams.get('next') ?? '/upload';

  // Only ever redirect back into this app.
  const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/upload';

  const verifier = randomString(32);
  const state = randomString(16);

  const authorize = new URL(cfg.authorizeUrl);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', cfg.clientId);
  authorize.searchParams.set('redirect_uri', `${origin}/api/auth/callback`);
  authorize.searchParams.set('scope', cfg.scopes);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('code_challenge', await challengeFor(verifier));
  authorize.searchParams.set('code_challenge_method', 'S256');

  const res = NextResponse.redirect(authorize.toString());
  const shortLived = {
    httpOnly: true,
    secure: secureCookies,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 600,
  };
  res.cookies.set(COOKIE.verifier, verifier, shortLived);
  res.cookies.set(COOKIE.state, state, shortLived);
  res.cookies.set(COOKIE.next, next, shortLived);
  return res;
}
