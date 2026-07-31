import { NextResponse } from 'next/server';
import { apiSession } from '@/lib/auth/guard';
import { APP_SOURCE, callMatchService, serviceResponse } from '@/lib/match/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 20 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
]);

const ALLOWED_EXT = /\.(pdf|docx|doc|txt)$/i;

/**
 * Put one raw resume file into the searchable bank.
 *
 * The engine does the whole chain behind this route — parse the file through
 * the extraction service, project it, embed it, store it — so a batch of a
 * hundred files is a hundred calls to here and nothing else. It is idempotent
 * on `resume_id`: a file already indexed is skipped before the expensive parse,
 * which is what makes a half-finished batch safe to run again.
 */
export async function POST(req: Request) {
  const session = await apiSession();
  if (!session.ok) {
    return NextResponse.json({ detail: 'Sign in to add resumes.' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ detail: 'The upload could not be read.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ detail: 'Attach a resume file.' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ detail: 'That file is empty.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ detail: 'That file is over 20 MB.' }, { status: 413 });
  }
  if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXT.test(file.name)) {
    return NextResponse.json({ detail: 'Use a PDF, DOCX, DOC, or TXT file.' }, { status: 415 });
  }

  const params = new URL(req.url).searchParams;
  const resumeId = (params.get('resume_id') ?? file.name).trim();
  const force = params.get('force') === 'true';

  const outbound = new FormData();
  outbound.append('file', file, file.name);

  // Tagged on the way in: which app stored it, and who. That tagging is what a
  // scoped search reads back, so these resumes rank on their own.
  const query = new URLSearchParams({ resume_id: resumeId, source: APP_SOURCE });
  if (session.owner) query.set('owner', session.owner);
  if (force) query.set('force', 'true');

  return serviceResponse(
    await callMatchService(`/ingest?${query.toString()}`, {
      body: outbound,
      // Parsing a resume is the slow half; the extraction engine is given the
      // same headroom here as it gets on the single-file path.
      timeoutMs: 180_000,
    }),
  );
}
