import { NextResponse } from 'next/server';
import { aggregate, applyFilters, exportMinCount, locate } from '@/lib/talent/aggregate';
import { audit, listCompanies } from '@/lib/talent/db';
import { listRecords } from '@/lib/talent/extractions';
import { filtersFromQuery } from '@/lib/talent/filters';
import { talentCaller } from '@/lib/talent/tenant';
import { toCsv, writeXlsx } from '@/lib/talent/xlsx';
import { CLIENT_STATUS_LABEL } from '@/lib/talent/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Download the current view as Excel or CSV. Exports carry counts per company
 * only — never a row per candidate — and the minimum-count rule applies, so a
 * file that leaves the building cannot single anyone out.
 */
export async function GET(req: Request) {
  const who = await talentCaller();
  if (!who.ok) return who.response;
  const { tenant, user } = who.caller;

  const url = new URL(req.url);
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'xlsx';
  const mode = url.searchParams.get('mode') === 'sales' ? 'sales' : 'recruiting';
  const filters = filtersFromQuery(url);

  const [records, companies] = await Promise.all([listRecords(tenant), listCompanies(tenant)]);
  const all = locate(records);
  const view = aggregate(all, applyFilters(all, filters, companies), companies, exportMinCount());

  const header =
    mode === 'sales'
      ? ['Company', 'Industry', 'Talent count', 'Top title family', 'Top skills', 'Locations', 'Client status', 'Prospect list', 'Website', 'Careers page', 'Main phone']
      : ['Company', 'Industry', 'Talent count', 'Top title family', 'Top skills', 'Locations'];
  const rows = view.companies.map(c => {
    const base = [c.name, c.industry, c.count, c.topFamily, c.topSkills.join(', '), c.places.join('; ')];
    return mode === 'sales'
      ? [...base, CLIENT_STATUS_LABEL[c.status], c.prospect ? 'Yes' : '', c.website ?? '', c.careers ?? '', c.phone ?? '']
      : base;
  });

  await audit(tenant, user, 'export', { format, mode, rows: rows.length });

  const stamp = new Date().toISOString().slice(0, 10);
  const name = `talent-${mode}-${stamp}.${format}`;
  if (format === 'csv') {
    return new NextResponse('﻿' + toCsv(header, rows), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` },
    });
  }
  const file = await writeXlsx(mode === 'sales' ? 'Companies' : 'Talent', header, rows);
  return new NextResponse(Buffer.from(file), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  });
}
