import { NextResponse } from 'next/server';
import { apiSession } from '@/lib/auth/guard';
import { callMatchService, serviceResponse } from '@/lib/match/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
