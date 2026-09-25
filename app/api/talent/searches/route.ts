import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { deleteSearch, listSearches, putSearch } from '@/lib/talent/db';
import { parseFilters } from '@/lib/talent/filters';
import { talentCaller } from '@/lib/talent/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Saved searches belong to the person who saved them. */
export async function GET() {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;
  return NextResponse.json(await listSearches(tenant, user).catch(() => []));
}

export async function POST(req: Request) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;

  const body = (await req.json().catch(() => ({}))) as { name?: string; mode?: string; filters?: unknown };
  const name = (body.name ?? '').trim().slice(0, 80);
  if (!name) return NextResponse.json({ detail: 'Name the search to save it.' }, { status: 400 });

  const search = {
    id: randomUUID(),
    name,
    mode: body.mode === 'sales' ? 'sales' : 'recruiting',
    filters: parseFilters(body.filters),
    createdAt: new Date().toISOString(),
  };
  try {
    await putSearch(tenant, user, search);
  } catch {
    return NextResponse.json({ detail: 'The search could not be saved.' }, { status: 502 });
  }
  return NextResponse.json(search);
}

export async function DELETE(req: Request) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ detail: 'Missing search id.' }, { status: 400 });
  await deleteSearch(tenant, user, id).catch(() => {});
  return NextResponse.json({ deleted: true });
}
