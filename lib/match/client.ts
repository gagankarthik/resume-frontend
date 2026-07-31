import type { IngestResponse, MatchResponse } from './types';

/**
 * Browser-side calls for matching.
 *
 * Everything goes to this app's own /api/match/* routes, which hold the
 * engine's URL and key and scope every call to this account's resumes.
 * Mirrors lib/api.ts, including the expired-session handoff to sign-in.
 */

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = `/signin?next=${encodeURIComponent('/match')}`;
      throw new Error('Your session has expired. Taking you to sign in…');
    }
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `The request failed (HTTP ${res.status}).`);
  }
  return res.json() as Promise<T>;
}

/** Rank the uploaded resumes against a job, best fit first. */
export async function matchCandidates(
  jobText: string,
  signal?: AbortSignal,
): Promise<MatchResponse> {
  const res = await fetch('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_text: jobText }),
    signal,
  });
  return handle<MatchResponse>(res);
}

/**
 * Add one file to the searchable set: parsed, projected, embedded, stored.
 *
 * The id is the filename, so the same file uploaded twice overwrites rather
 * than duplicates — and the engine skips it before parsing, which is what
 * makes re-running an interrupted batch cheap.
 */
export async function ingestResume(
  file: File,
  signal?: AbortSignal,
): Promise<IngestResponse> {
  const form = new FormData();
  form.append('file', file, file.name);

  const res = await fetch(`/api/match/ingest?resume_id=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    body: form,
    signal,
  });
  return handle<IngestResponse>(res);
}

/**
 * Run a batch of files through ingest, a few at a time.
 *
 * Each file is a parse on the far side, so a hundred resumes is minutes of
 * work; the queue keeps a handful in flight and reports every outcome as it
 * lands rather than at the end. Three at once is what the extraction service
 * comfortably takes.
 */
export async function ingestQueue(
  files: File[],
  {
    concurrency = 3,
    signal,
    onStart,
    onSettled,
  }: {
    concurrency?: number;
    signal?: AbortSignal;
    onStart?: (file: File) => void;
    onSettled?: (
      file: File,
      result: { ok: true; skipped: boolean } | { ok: false; error: string },
    ) => void;
  },
): Promise<void> {
  let cursor = 0;

  const worker = async () => {
    while (cursor < files.length) {
      if (signal?.aborted) return;
      const file = files[cursor++];
      onStart?.(file);
      try {
        const res = await ingestResume(file, signal);
        onSettled?.(file, { ok: true, skipped: Boolean(res.skipped) });
      } catch (err) {
        if (signal?.aborted) return;
        onSettled?.(file, {
          ok: false,
          error: err instanceof Error ? err.message : 'The file could not be added.',
        });
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
}

/** Take one resume back out of the searchable set. */
export async function removeResume(resumeId: string): Promise<{ removed: boolean }> {
  const res = await fetch(`/api/match/resume?resume_id=${encodeURIComponent(resumeId)}`, {
    method: 'DELETE',
  });
  return handle<{ removed: boolean }>(res);
}
