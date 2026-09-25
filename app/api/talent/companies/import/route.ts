import { NextResponse } from 'next/server';
import { audit, listCompanies, putCompanies } from '@/lib/talent/db';
import { listRecords } from '@/lib/talent/extractions';
import { normalizeCompany } from '@/lib/talent/normalize';
import { talentCaller } from '@/lib/talent/tenant';
import { readCsv, readXlsx, writeXlsx } from '@/lib/talent/xlsx';
import type { ClientStatus, CompanyProfile } from '@/lib/talent/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEADER = ['Company', 'Client status', 'Website', 'Careers page', 'Main phone'];

/**
 * The Excel template for client status. Pre-filled with every company already
 * on the caller's map, so the team fills in a column rather than typing names.
 */
export async function GET() {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant } = who.caller;

  const [records, companies] = await Promise.all([listRecords(tenant), listCompanies(tenant)]);
  const names = new Map<string, string>();
  for (const r of records) names.set(r.companyKey, r.company);
  for (const c of companies.values()) names.set(c.key, c.name);

  const rows = [...names.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([key, name]) => {
      const c = companies.get(key);
      return [name, label(c?.status ?? 'none'), c?.website ?? '', c?.careers ?? '', c?.phone ?? ''];
    });

  const file = await writeXlsx('Client status', HEADER, rows);
  return new NextResponse(Buffer.from(file), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="client-status-template.xlsx"',
    },
  });
}

const label = (s: ClientStatus) =>
  ({ client: 'Active client', target: 'Target', former: 'Former client', none: 'Not engaged' })[s];

function parseStatus(v: string): ClientStatus | null {
  const s = v.trim().toLowerCase();
  if (!s) return null;
  if (/former|past|lapsed|inactive/.test(s)) return 'former';
  if (/active|client|customer|current/.test(s)) return 'client';
  if (/target|prospect|pursuing|pipeline/.test(s)) return 'target';
  if (/not|none|no\b|n\/a/.test(s)) return 'none';
  return null;
}

/** Upload the filled-in template (.xlsx or .csv) to set client status in bulk. */
export async function POST(req: Request) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ detail: 'Attach the filled-in template.' }, { status: 400 });
  if (file.size > 5_000_000) return NextResponse.json({ detail: 'The file is larger than 5 MB.' }, { status: 413 });

  let rows: string[][];
  try {
    rows = /\.csv$/i.test(file.name) ? readCsv(await file.text()) : await readXlsx(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ detail: 'The file could not be read. Use the .xlsx template or a .csv.' }, { status: 400 });
  }
  if (rows.length < 2) return NextResponse.json({ detail: 'The file has no rows under the header.' }, { status: 400 });

  const head = rows[0].map(h => h.trim().toLowerCase());
  const col = (re: RegExp) => head.findIndex(h => re.test(h));
  const iName = col(/company|employer|account/);
  const iStatus = col(/status/);
  const iWeb = col(/website|url|domain/);
  const iCareers = col(/career|jobs/);
  const iPhone = col(/phone/);
  if (iName < 0) return NextResponse.json({ detail: 'The file needs a "Company" column.' }, { status: 400 });

  const existing = await listCompanies(tenant);
  const now = new Date().toISOString();
  const updates: CompanyProfile[] = [];
  let skipped = 0;
  for (const r of rows.slice(1, 5001)) {
    const n = normalizeCompany(r[iName]);
    if (!n) { skipped++; continue; }
    const prev = existing.get(n.key);
    const status = iStatus >= 0 ? parseStatus(r[iStatus] ?? '') : null;
    const cell = (i: number) => (i >= 0 && r[i]?.trim() ? r[i].trim().slice(0, 300) : undefined);
    updates.push({
      key: n.key,
      name: prev?.name ?? n.name,
      status: status ?? prev?.status ?? 'none',
      website: cell(iWeb) ?? prev?.website,
      careers: cell(iCareers) ?? prev?.careers,
      phone: cell(iPhone)?.slice(0, 40) ?? prev?.phone,
      prospect: prev?.prospect ?? false,
      updatedAt: now,
      updatedBy: user,
    });
  }

  try {
    await putCompanies(tenant, updates);
    await audit(tenant, user, 'import-status', { rows: updates.length });
  } catch {
    return NextResponse.json({ detail: 'The companies could not be saved. Try again.' }, { status: 502 });
  }
  return NextResponse.json({ updated: updates.length, skipped });
}
