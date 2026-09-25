import { NextResponse } from 'next/server';
import { authConfigured } from '@/lib/auth/config';
import { getSessionUser } from '@/lib/auth/guard';
import { talentConfigured } from './db';

/**
 * Who is asking, and whose data they may see.
 *
 * A tenant is an organisation. Users carry it in the Cognito attribute
 * `custom:tenant_id`; without one they belong to NEXT_TALENT_DEFAULT_TENANT
 * (the organisation that runs this deployment), and only if that is unset
 * are they their own tenant. Every read and write goes through the tenant's
 * own partition — there is no query that crosses tenants.
 */

export type TalentCaller = { tenant: string; user: string };

export async function talentCaller(): Promise<
  { ok: true; caller: TalentCaller } | { ok: false; response: NextResponse }
> {
  if (!talentConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { detail: 'The talent map is not set up yet. Add NEXT_TALENT_TABLE to the environment.' },
        { status: 503 },
      ),
    };
  }

  if (!authConfigured()) {
    // Open deployments exist for local development only. Stored talent data
    // needs an owner, so a production build without sign-in refuses.
    if (process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        response: NextResponse.json({ detail: 'Sign-in is required for the talent map.' }, { status: 401 }),
      };
    }
    return { ok: true, caller: { tenant: process.env.NEXT_TALENT_DEFAULT_TENANT ?? 'local', user: 'local' } };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ detail: 'Sign in to use the talent map.' }, { status: 401 }) };
  }
  // An explicit organisation wins; otherwise this deployment's shared workspace
  // (Ocean Blue's own site); only without either is a user kept on their own.
  const tenant = user.tenant ?? process.env.NEXT_TALENT_DEFAULT_TENANT ?? `user-${user.sub}`;
  return { ok: true, caller: { tenant, user: user.sub } };
}
