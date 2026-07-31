import { NextResponse } from 'next/server';
import { COOKIE, cognitoConfig, originFrom, secureCookies } from '@/lib/auth/config';
import { verifyIdToken } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failure(origin: string, reason: string) {
  const url = new URL('/signed-out', origin);
  url.searchParams.set('error', reason);
  return NextResponse.redirect(url.toString());
}

/**
 * Finish sign-in: check the state, trade the code for tokens using the PKCE
 * verifier, verify the ID token, then store it in an httpOnly cookie.
 */
export async function GET(req: Request) {
  const origin = originFrom(req);
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (url.searchParams.get('error')) {
    return failure(origin, url.searchParams.get('error') ?? 'denied');
  }
  if (!code) return failure(origin, 'missing_code');

  const jar = req.headers.get('cookie') ?? '';
  const read = (name: string) =>
    jar
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith(`${name}=`))
      ?.slice(name.length + 1);

  const verifier = read(COOKIE.verifier);
  const expectedState = read(COOKIE.state);
  const next = decodeURIComponent(read(COOKIE.next) ?? '/upload');

  if (!verifier || !expectedState || state !== expectedState) {
    return failure(origin, 'bad_state');
  }

  const cfg = cognitoConfig();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: cfg.clientId,
    code,
    redirect_uri: `${origin}/api/auth/callback`,
    code_verifier: verifier,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (cfg.clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64')}`;
  }

  const tokenRes = await fetch(cfg.tokenUrl, { method: 'POST', headers, body });
  if (!tokenRes.ok) return failure(origin, 'token_exchange_failed');

  const tokens = (await tokenRes.json()) as {
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!tokens.id_token) return failure(origin, 'no_id_token');

  const user = await verifyIdToken(tokens.id_token);
  if (!user) return failure(origin, 'invalid_id_token');

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/upload';
  const res = NextResponse.redirect(new URL(safeNext, origin).toString());

  res.cookies.set(COOKIE.session, tokens.id_token, {
    httpOnly: true,
    secure: secureCookies,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expires_in ?? 3600,
  });

  if (tokens.refresh_token) {
    res.cookies.set(COOKIE.refresh, tokens.refresh_token, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  for (const name of [COOKIE.verifier, COOKIE.state, COOKIE.next]) {
    res.cookies.set(name, '', { path: '/', maxAge: 0 });
  }

  return res;
}
