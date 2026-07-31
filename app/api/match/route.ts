import { NextResponse } from 'next/server';
import { apiSession } from '@/lib/auth/guard';
import { APP_SOURCE, callMatchService, serviceResponse } from '@/lib/match/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A pasted description, not a book. Well past any real posting. */
const MAX_JOB_CHARS = 20_000;

/** How many ranked candidates come back. */
const TOP_K = 10;

/**
 * How many resumes the model reads before the ranking is cut to TOP_K.
 *
 * Every shortlisted resume costs output tokens in one re-rank call, so this is
 * capped: past roughly forty the reply runs out of room mid-list and the tail
 * comes back with no verdict at all.
 */
const POOL = 30;

/**
 * Rank this account's resumes against a job.
 *
 * The engine does the work — read the description, embed it, pull the nearest
 * resumes, re-rank them with a model. This route is the boundary: it verifies
 * the session, bounds the input, scopes the search to the resumes this account
 * uploaded, and keeps the engine's URL and key on the server.
 */
export async function POST(req: Request) {
  const session = await apiSession();
  if (!session.ok) {
    return NextResponse.json({ detail: 'Sign in to match candidates.' }, { status: 401 });
  }

  let body: { job_text?: unknown } | null;
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ detail: 'The request could not be read.' }, { status: 400 });
  }

  const jobText = typeof body?.job_text === 'string' ? body.job_text.trim() : '';
  if (!jobText) {
    return NextResponse.json({ detail: 'Paste a job description first.' }, { status: 400 });
  }
  if (jobText.length > MAX_JOB_CHARS) {
    return NextResponse.json(
      { detail: 'That job description is too long. Trim it to the role, requirements, and skills.' },
      { status: 413 },
    );
  }

  const result = await callMatchService('/match', {
    body: {
      job_text: jobText,
      top_k: TOP_K,
      pool: POOL,
      // The store is shared with another application's resume bank. Scoping to
      // this app, and to this account inside it, is what keeps a search to the
      // resumes the person uploaded here.
      source: APP_SOURCE,
      owner: session.owner ?? undefined,
    },
  });

  return serviceResponse(result.ok ? { ...result, data: ourCandidatesOnly(result.data) } : result);
}

/**
 * Transitional guard: drop anything the engine returned from the other
 * application's bank.
 *
 * An engine deployed before `source`/`owner` filtering existed ignores the
 * scope in the request and ranks its whole store. Those records are S3 keys,
 * and a key has slashes in it; nothing this app writes ever does, because its
 * ids are filenames. Once the scoped engine is live this filter matches
 * everything and can be deleted.
 */
function ourCandidatesOnly(data: unknown): unknown {
  const body = data as { candidates?: { resume_id?: string }[] } | null;
  if (!body || !Array.isArray(body.candidates)) return data;
  const candidates = body.candidates.filter(c => !String(c.resume_id ?? '').includes('/'));
  return { ...body, candidates, count: candidates.length };
}
