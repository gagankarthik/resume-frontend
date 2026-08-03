import { SignJWT } from 'jose';
import { extractionSecret } from '@/lib/auth/config';

/**
 * Upload tickets for the extraction engine.
 *
 * The browser sends resumes straight to the engine rather than through this
 * app. That is not a shortcut — the extraction pipeline runs 30-90 seconds and
 * Amplify's CloudFront closes any proxied response at 30, so a proxied upload
 * returns 504 for every resume that isn't trivially short.
 *
 * Posting direct means the engine cannot see the caller's Cognito cookie, so
 * something else has to prove the upload is allowed. This app checks the
 * session and signs a short-lived ticket; the engine verifies the signature
 * with the same secret and refuses anything else. The secret never leaves the
 * server — only the ticket does.
 *
 * The ticket is deliberately not the user's ID token. The engine has no
 * business knowing about the user pool, and a five-minute upload pass is a far
 * smaller thing to leak than a session.
 */

/** Header the engine reads. Not `Authorization`, which Function URLs may claim. */
export const TICKET_HEADER = 'X-Extraction-Token';

/** Must match AUDIENCE in the engine's auth.py. */
const AUDIENCE = 'resume-extraction-engine';

/**
 * Long enough to pick a file and start the upload, short enough that a leaked
 * ticket is worthless by the time anyone finds it. The engine independently
 * caps the lifetime it will accept, so raising this alone will not extend it.
 */
const TTL_SECONDS = 300;

export type UploadTicket = {
  /** Engine origin. Handed out only after the session check. */
  url: string;
  /** Header name to send the ticket in. */
  header: string;
  /** The signed ticket. */
  token: string;
  /** Seconds until it stops working. */
  expiresIn: number;
};

/**
 * Sign a ticket for `subject`.
 *
 * Throws when no secret is configured. That is deliberate: minting an
 * unsigned or predictable ticket would leave the engine open, and this app has
 * already been bitten once by a missing variable degrading into silence.
 */
export async function mintUploadTicket(subject: string | null): Promise<string> {
  const secret = extractionSecret();
  if (!secret) {
    throw new Error('NEXT_EXTRACTION_SHARED_SECRET is not set, so no upload ticket can be signed.');
  }

  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    // The engine logs this to tie an extraction to a person. An open
    // deployment has no Cognito id, and none is invented.
    .setSubject(subject ?? 'anonymous')
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));
}

export const TICKET_TTL_SECONDS = TTL_SECONDS;
