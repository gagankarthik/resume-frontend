import { NextResponse } from 'next/server';
import { extractionUrl } from '@/lib/auth/config';
import { apiSession } from '@/lib/auth/guard';
import { TICKET_HEADER, mintUploadTicket } from '@/lib/extract/ticket';
import { describeRejection } from '@/lib/files';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Proxy to the extraction engine. NOT the path the browser uses.
 *
 * Amplify serves this route through CloudFront, which closes a response after
 * 30 seconds. The extraction pipeline runs 30-90, so a real resume uploaded
 * here returns 504 no matter what timeout this handler sets — that was the bug
 * that sent uploads direct in the first place. The browser now calls
 * /api/extract/ticket and posts to the engine itself; see lib/api.ts.
 *
 * This is kept for callers that are not a browser and not behind that ceiling
 * (scripts, a local `next start`, small files), and because leaving a
 * half-authenticated proxy in the tree is worse than keeping one that works.
 * It authorises with the same signed ticket the direct path uses.
 */
export async function POST(req: Request) {
  // Same gate as the ticket route, and it also yields the Cognito id the
  // engine logs against the extraction.
  const session = await apiSession();
  if (!session.ok) {
    return NextResponse.json({ detail: 'Sign in to upload a resume.' }, { status: 401 });
  }
  const owner = session.owner;

  const engine = extractionUrl();
  if (!engine) {
    return NextResponse.json({ detail: 'The extraction service is not configured.' }, { status: 503 });
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

  // Same rules and the same wording the browser sees before it ever uploads —
  // one table in lib/files.ts, so this cannot drift from the dropzone.
  const problem = describeRejection(file);
  if (problem) {
    return NextResponse.json({ detail: problem.message }, { status: problem.status });
  }

  const outbound = new FormData();
  outbound.append('file', file, file.name);

  // Was `x-api-key` from EXTRACTION_API_KEY: a variable no deployment set, that
  // the engine never checked, and whose name lacked the NEXT_ prefix the build
  // copies into the runtime. It authenticated nothing. The engine now requires
  // the same signed ticket the browser path uses.
  const headers: Record<string, string> = {};
  try {
    headers[TICKET_HEADER] = await mintUploadTicket(owner);
  } catch {
    return NextResponse.json(
      { detail: 'Uploads are not available: the extraction service is not configured.' },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(`${engine}/extract`, {
      method: 'POST',
      body: outbound,
      headers,
      signal: AbortSignal.timeout(180_000),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'The extraction service did not respond. Try again in a moment.' },
      { status: 502 },
    );
  }
}
