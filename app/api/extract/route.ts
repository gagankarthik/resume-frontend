import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, authConfigured, extractionUrl } from '@/lib/auth/config';
import { verifyIdToken } from '@/lib/auth/session';

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
 * Proxy to the extraction engine.
 *
 * Everything sensitive stays on this side of the wire: the engine's URL is a
 * server-only variable, the caller's session is verified against Cognito's
 * JWKS before a byte is forwarded, and the file is streamed through without
 * being written to disk.
 */
export async function POST(req: Request) {
  if (authConfigured()) {
    const token = (await cookies()).get(COOKIE.session)?.value;
    const user = token ? await verifyIdToken(token) : null;
    if (!user) {
      return NextResponse.json({ detail: 'Sign in to upload a resume.' }, { status: 401 });
    }
  }

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
  if (file.size === 0) {
    return NextResponse.json({ detail: 'That file is empty.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ detail: 'That file is over 20 MB.' }, { status: 413 });
  }
  if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXT.test(file.name)) {
    return NextResponse.json(
      { detail: 'Use a PDF, DOCX, DOC, or TXT file.' },
      { status: 415 },
    );
  }

  const outbound = new FormData();
  outbound.append('file', file, file.name);

  const headers: Record<string, string> = {};
  if (process.env.EXTRACTION_API_KEY) {
    headers['x-api-key'] = process.env.EXTRACTION_API_KEY;
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
