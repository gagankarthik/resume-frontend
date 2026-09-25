import { NextResponse } from 'next/server';
import { aggregate, applyFilters, locate } from '@/lib/talent/aggregate';
import { audit, listCompanies } from '@/lib/talent/db';
import { listRecords } from '@/lib/talent/extractions';
import { parseFilters } from '@/lib/talent/filters';
import { talentCaller } from '@/lib/talent/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The heat map for the caller's tenant, filtered and counted. */
export async function POST(req: Request) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;

  const body = (await req.json().catch(() => ({}))) as { filters?: unknown; mode?: string; audit?: boolean };
  const filters = parseFilters(body.filters);

  try {
    const [records, companies] = await Promise.all([listRecords(tenant), listCompanies(tenant)]);
    const all = locate(records);
    const filtered = applyFilters(all, filters, companies);
    if (body.audit) await audit(tenant, user, 'view', { mode: body.mode });
    return NextResponse.json(aggregate(all, filtered, companies));
  } catch {
    return NextResponse.json({ detail: 'The talent map could not be loaded. Try again in a moment.' }, { status: 502 });
  }
}
