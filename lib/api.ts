import type { APIResponse } from './types';

/**
 * The extraction engine is never called from the browser. Requests go to this
 * app's own /api/extract route, which verifies the session and forwards the
 * file — so the engine's URL and any key it needs stay server-side.
 */
export async function extractResume(file: File): Promise<APIResponse> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/extract', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = `/signin?next=${encodeURIComponent('/upload')}`;
      throw new Error('Your session has expired. Taking you to sign in…');
    }
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `The upload failed (HTTP ${res.status}).`);
  }

  return res.json() as Promise<APIResponse>;
}
