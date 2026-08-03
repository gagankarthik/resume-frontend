import type { APIResponse } from './types';

type Ticket = {
  url: string;
  header: string;
  token: string;
  expiresIn: number;
};

/** What the engine returns on a failure, and what /api/extract/ticket returns. */
type ErrorBody = { detail?: string };

async function detailFrom(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as ErrorBody;
  return body.detail ?? fallback;
}

function toSignIn(): never {
  window.location.href = `/signin?next=${encodeURIComponent('/upload')}`;
  throw new Error('Your session has expired. Taking you to sign in…');
}

/**
 * Upload a resume for extraction.
 *
 * Two steps, and the reason for both is the clock. The extraction pipeline
 * runs 30-90 seconds. Every route in this app sits behind Amplify's
 * CloudFront, which closes a response at 30 seconds and returns 504 — so a
 * resume cannot be proxied through /api/extract and come back. It has to go
 * from here straight to the engine, whose Lambda Function URL will hold the
 * connection for as long as the work takes.
 *
 * Going direct means the engine never sees the session cookie, so step one
 * asks this app for a short-lived signed ticket, which it issues only to a
 * verified session. Step two spends that ticket on the upload. The engine's
 * URL arrives with the ticket rather than being built into this bundle, so an
 * anonymous visitor is not simply handed it.
 */
export async function extractResume(file: File): Promise<APIResponse> {
  const ticketRes = await fetch('/api/extract/ticket', { method: 'POST' });

  if (!ticketRes.ok) {
    if (ticketRes.status === 401) toSignIn();
    throw new Error(await detailFrom(ticketRes, `The upload could not be started (HTTP ${ticketRes.status}).`));
  }

  const ticket = (await ticketRes.json()) as Ticket;

  const form = new FormData();
  form.append('file', file);

  let res: Response;
  try {
    res = await fetch(`${ticket.url}/extract`, {
      method: 'POST',
      body: form,
      headers: { [ticket.header]: ticket.token },
    });
  } catch {
    // A network-level failure here is not the ordinary "server said no": the
    // request never completed. The usual causes are a dropped connection
    // mid-upload or an origin the engine's CORS config does not allow.
    throw new Error('Could not reach the extraction service. Check your connection and try again.');
  }

  if (!res.ok) {
    // The ticket outlived its five minutes, or the engine rejected it.
    if (res.status === 401) {
      throw new Error('The upload authorisation expired. Try uploading again.');
    }
    throw new Error(await detailFrom(res, `The upload failed (HTTP ${res.status}).`));
  }

  return res.json() as Promise<APIResponse>;
}
