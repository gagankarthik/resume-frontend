import { NextResponse } from 'next/server';
import { COOKIE, authConfigured, cognitoConfig, originFrom, secureCookies } from '@/lib/auth/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Clear the local session, then end the session at Cognito too. */
export async function GET(req: Request) {
  const origin = originFrom(req);

  const target = authConfigured()
    ? (() => {
        const cfg = cognitoConfig();
        const url = new URL(cfg.logoutUrl);
        url.searchParams.set('client_id', cfg.clientId);
        url.searchParams.set('logout_uri', `${origin}/signed-out`);
        return url.toString();
      })()
    : `${origin}/signed-out`;

  const res = NextResponse.redirect(target);
  res.cookies.set(COOKIE.session, '', {
    httpOnly: true,
    secure: secureCookies,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.cookies.set(COOKIE.refresh, '', {
    httpOnly: true,
    secure: secureCookies,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 0,
  });
  return res;
}
