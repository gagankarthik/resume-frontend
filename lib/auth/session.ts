import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { cognitoConfig } from './config';

export type SessionUser = {
  sub: string;
  email?: string;
  name?: string;
  groups?: string[];
  exp: number;
};

/**
 * One JWKS cache per process. `jose` handles fetching, caching, and rotation,
 * so a key roll does not take sign-in down.
 */
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function keySet() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(cognitoConfig().jwksUri));
  return jwks;
}

/**
 * Verify a Cognito ID token: signature against the pool's JWKS, issuer, and
 * audience. A token that fails any check is treated as no session at all.
 */
export async function verifyIdToken(token: string): Promise<SessionUser | null> {
  const cfg = cognitoConfig();
  try {
    const { payload } = await jwtVerify(token, keySet(), {
      issuer: cfg.issuer,
      audience: cfg.clientId,
    });

    if (payload.token_use !== 'id') return null;

    return {
      sub: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: pickName(payload),
      groups: Array.isArray(payload['cognito:groups'])
        ? (payload['cognito:groups'] as string[])
        : undefined,
      exp: Number(payload.exp ?? 0),
    };
  } catch {
    return null;
  }
}

function pickName(payload: JWTPayload): string | undefined {
  for (const key of ['name', 'given_name', 'preferred_username', 'cognito:username']) {
    const v = payload[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return undefined;
}
