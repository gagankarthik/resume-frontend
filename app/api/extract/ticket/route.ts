import { NextResponse } from 'next/server';
import { extractionUrl } from '@/lib/auth/config';
import { apiSession } from '@/lib/auth/guard';
import { TICKET_HEADER, TICKET_TTL_SECONDS, mintUploadTicket } from '@/lib/extract/ticket';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hand a signed-in caller what it needs to upload a resume directly.
 *
 * This is the session boundary for uploads. The file itself never comes
 * through this app — it goes from the browser to the extraction engine, which
 * is the only way a 30-90 second pipeline can complete without hitting the
 * 30-second CloudFront ceiling in front of every route here.
 *
 * POST rather than GET so no cache, prefetch, or link ever produces a ticket
 * as a side effect.
 */
export async function POST() {
  const session = await apiSession();
  if (!session.ok) {
    return NextResponse.json({ detail: 'Sign in to upload a resume.' }, { status: 401 });
  }

  const url = extractionUrl();
  if (!url) {
    return NextResponse.json({ detail: 'The extraction service is not configured.' }, { status: 503 });
  }

  let token: string;
  try {
    token = await mintUploadTicket(session.owner);
  } catch {
    // The secret is missing. Say so as a service fault rather than letting the
    // upload fail later with something that looks like the user's mistake.
    return NextResponse.json(
      { detail: 'Uploads are not available: the extraction service is not configured.' },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { url, header: TICKET_HEADER, token, expiresIn: TICKET_TTL_SECONDS },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
