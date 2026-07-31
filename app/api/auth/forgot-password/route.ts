import { NextResponse } from 'next/server';
import { authConfigured } from '@/lib/auth/config';
import {
  CognitoRequestError,
  confirmForgotPassword,
  forgotPassword,
  readableError,
} from '@/lib/auth/cognito-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Start or finish a password reset.
 *
 * Starting a reset always reports success, whether or not the address has an
 * account, so this endpoint cannot be used to enumerate users.
 */
export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: 'Sign-in is not configured.' }, { status: 503 });
  }

  let body: { email?: string; code?: string; newPassword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'That request could not be read.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'Enter your email address.' }, { status: 400 });
  }

  const finishing = Boolean(body.code && body.newPassword);

  try {
    if (finishing) {
      await confirmForgotPassword(email, body.code!, body.newPassword!);
      return NextResponse.json({ ok: true, stage: 'done' });
    }

    await forgotPassword(email);
    return NextResponse.json({ ok: true, stage: 'sent' });
  } catch (err) {
    if (err instanceof CognitoRequestError) {
      // Requesting a code never reveals whether the account exists.
      if (!finishing && (err.code === 'UserNotFoundException' || err.code === 'InvalidParameterException')) {
        return NextResponse.json({ ok: true, stage: 'sent' });
      }
      return NextResponse.json({ error: readableError(err.code), code: err.code }, { status: 400 });
    }
    return NextResponse.json({ error: 'That could not be completed.' }, { status: 502 });
  }
}
