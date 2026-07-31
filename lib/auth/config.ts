/**
 * Cognito configuration.
 *
 * Names carry the NEXT_ prefix so they list cleanly in Amplify, but none of
 * them use NEXT_PUBLIC_ — that prefix is what inlines a value into the browser
 * bundle. Everything here is read in route handlers and server components
 * only, and the tokens live in httpOnly cookies the page script cannot touch.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in the Cognito settings.`,
    );
  }
  return value;
}

export function cognitoConfig() {
  const domain = required('NEXT_COGNITO_DOMAIN').replace(/\/$/, '');
  const region = process.env.NEXT_AWS_REGION ?? 'us-east-2';
  const userPoolId = required('NEXT_COGNITO_USER_POOL_ID');

  return {
    domain,
    region,
    userPoolId,
    clientId: required('NEXT_COGNITO_CLIENT_ID'),
    /** Only set for a confidential app client; a public SPA client has none. */
    clientSecret: process.env.NEXT_COGNITO_CLIENT_SECRET,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
    authorizeUrl: `${domain}/oauth2/authorize`,
    tokenUrl: `${domain}/oauth2/token`,
    logoutUrl: `${domain}/logout`,
    scopes: (process.env.NEXT_COGNITO_SCOPES ?? 'openid email profile').split(/\s+/).join(' '),
  };
}

/** True when the deployment has enough configuration for sign-in to work. */
export function authConfigured(): boolean {
  return Boolean(
    process.env.NEXT_COGNITO_DOMAIN &&
      process.env.NEXT_COGNITO_USER_POOL_ID &&
      process.env.NEXT_COGNITO_CLIENT_ID,
  );
}

/** The extraction engine, called only from /api/extract. */
export function extractionUrl(): string {
  return (process.env.NEXT_EXTRACTION_API_URL ?? '').replace(/\/$/, '');
}

/** The matching engine, called only from /api/match/*. */
export function matchUrl(): string {
  return (process.env.NEXT_RESUME_MATCH_API_URL ?? '').replace(/\/$/, '');
}

/**
 * Shared secret the matching engine expects in `X-API-Key`. Server-only — it is
 * read inside route handlers and never reaches a component that could ship it.
 */
export function matchKey(): string | undefined {
  return process.env.NEXT_RESUME_MATCH_API_KEY || undefined;
}

/** True when the deployment can reach the matching engine at all. */
export function matchConfigured(): boolean {
  return Boolean(matchUrl());
}

/**
 * Absolute origin for this request. Amplify sits behind CloudFront, so trust
 * the forwarded headers, and let NEXT_APP_ORIGIN override when a custom domain
 * differs from the host the app sees.
 */
export function originFrom(req: Request): string {
  if (process.env.NEXT_APP_ORIGIN) return process.env.NEXT_APP_ORIGIN.replace(/\/$/, '');
  const url = new URL(req.url);
  const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? url.host;
  return `${proto}://${host}`;
}

export const COOKIE = {
  session: 'tc_session',
  refresh: 'tc_refresh',
  verifier: 'tc_pkce',
  state: 'tc_state',
  next: 'tc_next',
} as const;

export const secureCookies = process.env.NODE_ENV === 'production';
