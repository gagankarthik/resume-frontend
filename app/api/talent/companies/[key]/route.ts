import { NextResponse } from 'next/server';
import { applyFilters, companyDetail, locate } from '@/lib/talent/aggregate';
import { audit, getCompany, listCompanies, putCompanies } from '@/lib/talent/db';
import { listRecords } from '@/lib/talent/extractions';
import { filtersFromQuery } from '@/lib/talent/filters';
import { talentCaller } from '@/lib/talent/tenant';
import type { ClientStatus, CompanyProfile } from '@/lib/talent/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ key: string }> };

/** The company card: talent breakdown under the current filters, plus its profile. */
export async function GET(req: Request, { params }: Ctx) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;
  const { key } = await params;

  try {
    const [records, companies] = await Promise.all([listRecords(tenant), listCompanies(tenant)]);
    const filtered = applyFilters(locate(records), filtersFromQuery(new URL(req.url)), companies);
    const name = records.find(r => r.companyKey === key)?.company ?? key;
    await audit(tenant, user, 'view-company', { company: key });
    return NextResponse.json(companyDetail(key, filtered, companies.get(key) ?? null, name));
  } catch {
    return NextResponse.json({ detail: 'The company could not be loaded.' }, { status: 502 });
  }
}

const STATUSES: ClientStatus[] = ['client', 'target', 'former', 'none'];

const cleanUrl = (v: unknown) => {
  if (typeof v !== 'string' || !v.trim()) return undefined;
  const s = v.trim().slice(0, 300);
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};
const cleanPhone = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 40) : undefined);

/** Update what the team knows about a company: status, website, careers page, main line, prospect list. */
export async function PUT(req: Request, { params }: Ctx) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;
  const { key } = await params;

  const body = (await req.json().catch(() => ({}))) as Partial<CompanyProfile>;
  const existing = await getCompany(tenant, key).catch(() => null);
  const records = await listRecords(tenant).catch(() => []);
  const name = existing?.name ?? records.find(r => r.companyKey === key)?.company ?? key;

  const next: CompanyProfile = {
    key,
    name,
    status: STATUSES.includes(body.status as ClientStatus) ? (body.status as ClientStatus) : existing?.status ?? 'none',
    website: 'website' in body ? cleanUrl(body.website) : existing?.website,
    careers: 'careers' in body ? cleanUrl(body.careers) : existing?.careers,
    phone: 'phone' in body ? cleanPhone(body.phone) : existing?.phone,
    prospect: typeof body.prospect === 'boolean' ? body.prospect : existing?.prospect ?? false,
    updatedAt: new Date().toISOString(),
    updatedBy: user,
  };

  try {
    await putCompanies(tenant, [next]);
    await audit(tenant, user, 'edit-company', { company: key });
    return NextResponse.json(next);
  } catch {
    return NextResponse.json({ detail: 'The company could not be saved.' }, { status: 502 });
  }
}
