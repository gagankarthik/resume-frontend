import { NextResponse } from 'next/server';
import { COOKIE, authConfigured, secureCookies } from '@/lib/auth/config';
import { verifyIdToken } from '@/lib/auth/session';
import {
  CognitoRequestError,
  readableError,
  respondToMfa,
  respondToNewPassword,
  signIn,
  type AuthResult,
} from '@/lib/auth/cognito-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  email?: string;
  password?: string;
  /** Present when answering a challenge from a previous attempt. */
  challenge?: 'NEW_PASSWORD_REQUIRED' | 'SOFTWARE_TOKEN_MFA' | 'SMS_MFA';
  session?: string;
  code?: string;
  newPassword?: string;
};

/**
 * Sign in against Cognito from our own form.
 *
 * The password arrives here over TLS, is passed straight to Cognito, and is
 * never logged or persisted. What comes back is verified and stored in an
 * httpOnly cookie, so the browser holds a session it cannot read.
 */
export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: 'Sign-in is not configured on this deployment.' },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'That request could not be read.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'Enter your email address.' }, { status: 400 });
  }

  try {
    let result: AuthResult;

    if (body.challenge === 'NEW_PASSWORD_REQUIRED') {
      if (!body.newPassword || !body.session) {
        return NextResponse.json({ error: 'Choose a new password.' }, { status: 400 });
      }
      result = await respondToNewPassword(email, body.newPassword, body.session);
    } else if (body.challenge === 'SOFTWARE_TOKEN_MFA' || body.challenge === 'SMS_MFA') {
      if (!body.code || !body.session) {
        return NextResponse.json({ error: 'Enter your verification code.' }, { status: 400 });
      }
      result = await respondToMfa(email, body.code, body.session, body.challenge);
    } else {
      if (!body.password) {
        return NextResponse.json({ error: 'Enter your password.' }, { status: 400 });
      }
      result = await signIn(email, body.password);
    }

    // Cognito wants something more before it will issue tokens.
    if (result.ChallengeName && !result.AuthenticationResult) {
      return NextResponse.json({
        challenge: result.ChallengeName,
        session: result.Session,
      });
    }

    const tokens = result.AuthenticationResult;
    if (!tokens?.IdToken) {
      return NextResponse.json({ error: 'Sign-in did not return an identity.' }, { status: 502 });
    }

    const user = await verifyIdToken(tokens.IdToken);
    if (!user) {
      return NextResponse.json({ error: 'The identity could not be verified.' }, { status: 502 });
    }

    const res = NextResponse.json({
      ok: true,
      user: { email: user.email, name: user.name },
    });

    res.cookies.set(COOKIE.session, tokens.IdToken, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.ExpiresIn ?? 3600,
    });

    if (tokens.RefreshToken) {
      res.cookies.set(COOKIE.refresh, tokens.RefreshToken, {
        httpOnly: true,
        secure: secureCookies,
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (err) {
    if (err instanceof CognitoRequestError) {
      // 401 for a bad credential, 400 for anything the user can correct.
      const status = err.code === 'NotAuthorizedException' || err.code === 'UserNotFoundException' ? 401 : 400;
      return NextResponse.json({ error: readableError(err.code), code: err.code }, { status });
    }
    return NextResponse.json(
      { error: 'Sign-in could not be completed. Try again in a moment.' },
      { status: 502 },
    );
  }
}
