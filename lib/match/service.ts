import { NextResponse } from 'next/server';
import { matchKey, matchUrl } from '@/lib/auth/config';

/**
 * Server-side client for the matching engine.
 *
 * The same rule as the extraction proxy: the engine's URL and shared secret are
 * server-only variables read here, inside route handlers, so the browser talks
 * to this app and never to the engine. Nothing in this file may be imported by
 * a client component.
 */

/**
 * The tag this app writes on every resume it stores, and matches against.
 *
 * The engine's store is shared with another application's resume bank. Scoping
 * every write and every search to this source is what keeps the two apart —
 * a search here ranks resumes uploaded here, and nothing else.
 *
 * This still reads 'truecopy' after the rename to Hire, deliberately. It is a
 * stored value, not a label: every resume already in the engine carries it, so
 * changing the string here without rewriting those rows would scope searches to
 * a tag nothing is filed under and return an empty set. Rename it only together
 * with a migration over the existing records.
 */
export const APP_SOURCE = 'truecopy';

export type ServiceResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; detail: string };

interface CallOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  /** JSON by default; a FormData body is forwarded as multipart, untouched. */
  body?: unknown;
  /** Embedding plus a model pass over the shortlist is slow; give it room. */
  timeoutMs?: number;
}

export async function callMatchService(
  path: string,
  { method = 'POST', body, timeoutMs = 120_000 }: CallOptions = {},
): Promise<ServiceResult> {
  const base = matchUrl();
  if (!base) {
    return { ok: false, status: 503, detail: 'The matching service is not configured.' };
  }

  // fetch sets the multipart boundary itself, so never name the type for a form.
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  const key = matchKey();
  if (key) headers['x-api-key'] = key;

  let upstream: Response;
  try {
    upstream = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    return timedOut
      ? {
          ok: false,
          status: 504,
          detail: 'The matching service took too long to answer. Try again, or shorten the job description.',
        }
      : { ok: false, status: 502, detail: 'The matching service did not respond. Try again in a moment.' };
  }

  const text = await upstream.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!upstream.ok) {
    const detail =
      (parsed as { detail?: unknown } | null)?.detail;
    return {
      ok: false,
      status: upstream.status,
      detail:
        typeof detail === 'string'
          ? detail
          : `The matching service returned HTTP ${upstream.status}.`,
    };
  }

  return { ok: true, status: upstream.status, data: parsed };
}

/** Turn a service result into the response this app's own route returns. */
export function serviceResponse(result: ServiceResult): NextResponse {
  return result.ok
    ? NextResponse.json(result.data, { status: result.status })
    : NextResponse.json({ detail: result.detail }, { status: result.status });
}
