import { NextResponse } from 'next/server';
import { apiSession } from '@/lib/auth/guard';
import { APP_SOURCE, callMatchService, serviceResponse } from '@/lib/match/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The fields the engine stores for a resume. Everything else the extractor
 * produces — contact details above all — is deliberately left behind: the
 * searchable bank needs enough to rank a candidate, not their phone number.
 */
const ANALYSIS_FIELDS = [
  'professional_summary',
  'objective',
  'work_experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'analytics',
] as const;

/** Beyond any real resume; a body this large is a mistake or an attack. */
const MAX_ANALYSIS_CHARS = 400_000;

/**
 * Store an already-parsed resume in the searchable bank.
 *
 * The counterpart to /api/match/ingest, and the one the browser uses. Ingest
 * hands a raw file to the engine, which parses it through the extraction
 * service — a minute of work, behind a CloudFront timeout of thirty seconds,
 * so it answers 504 for any resume worth adding. This route takes the parsed
 * result instead: the file was extracted directly by the browser, where there
 * is no such ceiling, and all that is left here is the embedding, which is fast.
 */
export async function POST(req: Request) {
  const session = await apiSession();
  if (!session.ok) {
    return NextResponse.json({ detail: 'Sign in to add resumes.' }, { status: 401 });
  }

  let body: { resume_id?: unknown; candidate_name?: unknown; analysis?: unknown } | null;
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ detail: 'The request could not be read.' }, { status: 400 });
  }

  const resumeId = typeof body?.resume_id === 'string' ? body.resume_id.trim() : '';
  if (!resumeId) {
    return NextResponse.json({ detail: 'A resume_id is required.' }, { status: 400 });
  }

  const analysis = body?.analysis;
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
    return NextResponse.json({ detail: 'A parsed resume is required.' }, { status: 400 });
  }

  // Forward only the fields the engine models. Passing the extractor's whole
  // output would ship contact details into the vector store for no benefit.
  const source = analysis as Record<string, unknown>;
  const trimmed: Record<string, unknown> = {};
  for (const field of ANALYSIS_FIELDS) {
    if (source[field] !== undefined && source[field] !== null) trimmed[field] = source[field];
  }

  if (Object.keys(trimmed).length === 0) {
    return NextResponse.json(
      { detail: 'That resume came back empty, so there is nothing to store.' },
      { status: 400 },
    );
  }

  if (JSON.stringify(trimmed).length > MAX_ANALYSIS_CHARS) {
    return NextResponse.json({ detail: 'That parsed resume is too large to store.' }, { status: 413 });
  }

  const candidateName =
    typeof body?.candidate_name === 'string' && body.candidate_name.trim()
      ? body.candidate_name.trim()
      : undefined;

  return serviceResponse(
    await callMatchService('/embed', {
      body: {
        resume_id: resumeId,
        candidate_name: candidateName,
        analysis: trimmed,
        // Same tagging ingest applies, so a search scoped to this app finds
        // resumes added by either route.
        source: APP_SOURCE,
        owner: session.owner ?? undefined,
      },
      // Embedding only — no parse behind this call, so it has no reason to be slow.
      timeoutMs: 25_000,
    }),
  );
}
