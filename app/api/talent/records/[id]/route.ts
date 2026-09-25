import { NextResponse } from 'next/server';
import { audit, hideRecord } from '@/lib/talent/db';
import { talentCaller } from '@/lib/talent/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Remove one candidate from the map — for a deletion request or an upload
 * that should not have been counted. They drop out of every count at once.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;
  const { id } = await params;
  if (!/^[a-z0-9]{16,40}$/i.test(id)) return NextResponse.json({ detail: 'Unknown record.' }, { status: 400 });

  try {
    await hideRecord(tenant, id, user);
    await audit(tenant, user, 'delete-record', { id });
  } catch {
    return NextResponse.json({ detail: 'The record could not be removed.' }, { status: 502 });
  }
  return NextResponse.json({ deleted: true });
}
