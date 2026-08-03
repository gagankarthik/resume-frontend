import { NextResponse } from 'next/server';
import { apiSession } from '@/lib/auth/guard';
import { callMatchService, serviceResponse } from '@/lib/match/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Is this resume already in the searchable set?
 *
 * Asked before a file is parsed, not after. Extraction is the expensive half —
 * a minute of LLM work per resume — so a batch that is re-run after being
 * interrupted should discover what it already has before spending that again.
 */
export async function GET(req: Request) {
  if (!(await apiSession()).ok) {
    return NextResponse.json({ detail: 'Sign in to check the resume bank.' }, { status: 401 });
  }

  const resumeId = (new URL(req.url).searchParams.get('resume_id') ?? '').trim();
  if (!resumeId) {
    return NextResponse.json({ detail: 'A resume_id is required.' }, { status: 400 });
  }

  const result = await callMatchService(`/vectors/${encodeURIComponent(resumeId)}/exists`, {
    method: 'GET',
    timeoutMs: 15_000,
  });

  // A lookup failure must not stop an upload: answering "not present" makes the
  // batch re-add a resume it already had, which overwrites rather than breaks.
  if (!result.ok) {
    return NextResponse.json({ exists: false, checked: false });
  }

  const data = result.data as { exists?: unknown } | null;
  return NextResponse.json({ exists: Boolean(data?.exists), checked: true });
}

/**
 * Take one resume back out of the searchable set.
 *
 * Ids are filenames, which never contain a slash, so the id rides in the path
 * of the engine's own delete without any escaping surprises.
 */
export async function DELETE(req: Request) {
  if (!(await apiSession()).ok) {
    return NextResponse.json({ detail: 'Sign in to remove a resume.' }, { status: 401 });
  }

  const resumeId = (new URL(req.url).searchParams.get('resume_id') ?? '').trim();
  if (!resumeId) {
    return NextResponse.json({ detail: 'A resume_id is required.' }, { status: 400 });
  }

  return serviceResponse(
    await callMatchService(`/vectors/${encodeURIComponent(resumeId)}`, {
      method: 'DELETE',
      timeoutMs: 20_000,
    }),
  );
}
