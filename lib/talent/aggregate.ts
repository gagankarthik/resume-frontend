import type {
  CompanyDetail,
  CompanyPoint,
  CompanyProfile,
  CompanyRow,
  CountItem,
  HeatCell,
  MapResponse,
  TalentFilters,
  TalentRecord,
} from './types';

/**
 * The aggregation layer: filter a tenant's records, then count them by area,
 * by employer site and by company. Everything the browser receives is a count
 * or an anonymous row — and any area or company under the minimum is dropped,
 * so a small cluster cannot be traced back to a person.
 */

/**
 * The smallest group shown. The requirement is five for client-facing views;
 * an organisation looking at its own data can lower it for the screen with
 * NEXT_TALENT_MIN_COUNT. Anything that leaves as a file uses the export
 * minimum (NEXT_TALENT_EXPORT_MIN_COUNT, never below five by default).
 */
function envCount(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}
export function minCount(): number {
  return envCount('NEXT_TALENT_MIN_COUNT', 5);
}
export function exportMinCount(): number {
  return envCount('NEXT_TALENT_EXPORT_MIN_COUNT', 5);
}

const R_MILES = 3958.8;
export function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_MILES * Math.asin(Math.sqrt(h));
}

type Located = TalentRecord & { lat: number; lng: number };

/**
 * Plot every record at its employer. A record without a work site falls back
 * to the company's most common known site in this tenant; with no known site
 * at all it stays off the map (but still counts in the table).
 */
export function locate(records: TalentRecord[]): TalentRecord[] {
  const sites = new Map<string, Map<string, { lat: number; lng: number; n: number; r: TalentRecord }>>();
  for (const r of records) {
    if (r.lat == null || r.lng == null) continue;
    const k = `${r.lat.toFixed(2)},${r.lng.toFixed(2)}`;
    const m = sites.get(r.companyKey) ?? new Map();
    const e = m.get(k) ?? { lat: r.lat, lng: r.lng, n: 0, r };
    e.n++;
    m.set(k, e);
    sites.set(r.companyKey, m);
  }
  return records.map(r => {
    if (r.lat != null && r.lng != null) return r;
    const m = sites.get(r.companyKey);
    if (!m) return r;
    const best = [...m.values()].sort((a, b) => b.n - a.n)[0];
    return {
      ...r,
      lat: best.lat,
      lng: best.lng,
      city: best.r.city,
      region: best.r.region,
      place: best.r.place,
      locSource: 'company-office' as const,
    };
  });
}

export function applyFilters(
  records: TalentRecord[],
  f: TalentFilters,
  companies: Map<string, CompanyProfile>,
  now = new Date(),
): TalentRecord[] {
  const kw = f.keyword?.trim().toLowerCase();
  const skills = (f.skills ?? []).map(s => s.toLowerCase());
  const since = f.months ? new Date(now.getFullYear(), now.getMonth() - f.months, now.getDate()).toISOString() : null;

  return records.filter(r => {
    if (f.families?.length && !f.families.includes(r.family)) return false;
    if (kw && !r.title.toLowerCase().includes(kw)) return false;
    if (skills.length) {
      const have = new Set(r.skills.map(s => s.toLowerCase()));
      const ok = f.skillMatch === 'all' ? skills.every(s => have.has(s)) : skills.some(s => have.has(s));
      if (!ok) return false;
    }
    if (f.industries?.length && !f.industries.includes(r.industry)) return false;
    if (f.companies?.length && !f.companies.includes(r.companyKey)) return false;
    if (f.states?.length && !(r.region && f.states.includes(r.region))) return false;
    if (f.radius) {
      if (r.lat == null || r.lng == null) return false;
      if (miles(f.radius, { lat: r.lat, lng: r.lng }) > f.radius.miles) return false;
    }
    if (f.seniority?.length && !f.seniority.includes(r.seniority)) return false;
    if (f.yoeMin != null && (r.yoe == null || r.yoe < f.yoeMin)) return false;
    if (f.yoeMax != null && (r.yoe == null || r.yoe > f.yoeMax)) return false;
    if (since && r.resumeDate < since) return false;
    if (f.minConfidence != null && r.confidence < f.minConfidence) return false;
    const profile = companies.get(r.companyKey);
    if (f.clientStatus?.length && !f.clientStatus.includes(profile?.status ?? 'none')) return false;
    if (f.prospectsOnly && !profile?.prospect) return false;
    return true;
  });
}

function top(values: string[], n: number): CountItem[] {
  const m = new Map<string, number>();
  for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, n);
}

export function aggregate(
  all: TalentRecord[],
  filtered: TalentRecord[],
  companies: Map<string, CompanyProfile>,
  min = minCount(),
): MapResponse {
  const located = filtered.filter((r): r is Located => r.lat != null && r.lng != null);

  // Heat: ~7-mile cells, weighted by head count.
  const cells = new Map<string, HeatCell>();
  for (const r of located) {
    const lat = Math.round(r.lat * 10) / 10;
    const lng = Math.round(r.lng * 10) / 10;
    const k = `${lat},${lng}`;
    const c = cells.get(k) ?? { lat, lng, count: 0 };
    c.count++;
    cells.set(k, c);
  }
  const heat = [...cells.values()].filter(c => c.count >= min);

  // Sites: one company at one place.
  const bySite = new Map<string, Located[]>();
  for (const r of located) {
    const k = `${r.companyKey}@${r.lat.toFixed(2)},${r.lng.toFixed(2)}`;
    const list = bySite.get(k) ?? [];
    list.push(r);
    bySite.set(k, list);
  }
  const points: CompanyPoint[] = [];
  for (const [siteKey, list] of bySite) {
    if (list.length < min) continue;
    const first = list[0];
    const p = companies.get(first.companyKey);
    points.push({
      key: first.companyKey,
      siteKey,
      name: first.company,
      industry: first.industry,
      place: first.place || [first.city, first.region].filter(Boolean).join(', '),
      lat: list.reduce((s, r) => s + r.lat, 0) / list.length,
      lng: list.reduce((s, r) => s + r.lng, 0) / list.length,
      count: list.length,
      topFamilies: top(list.map(r => r.family), 3),
      topSkills: top(list.flatMap(r => r.skills), 5),
      status: p?.status ?? 'none',
      prospect: Boolean(p?.prospect),
    });
  }
  points.sort((a, b) => b.count - a.count);

  // Resumes often give a city, not a street, so several employers can land on
  // the same point. Fan those out in a small ring (about two miles) so each
  // stays visible and hoverable. Display only: stored coordinates are untouched.
  const stacks = new Map<string, CompanyPoint[]>();
  for (const p of points) {
    const k = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
    const list = stacks.get(k) ?? [];
    list.push(p);
    stacks.set(k, list);
  }
  for (const list of stacks.values()) {
    if (list.length < 2) continue;
    const r = 0.025 + 0.004 * list.length;
    list.forEach((p, i) => {
      const t = (i / list.length) * Math.PI * 2;
      p.lat += Math.sin(t) * r;
      p.lng += (Math.cos(t) * r) / Math.cos((p.lat * Math.PI) / 180);
    });
  }

  // Companies, ranked by head count.
  const byCompany = new Map<string, TalentRecord[]>();
  for (const r of filtered) {
    const list = byCompany.get(r.companyKey) ?? [];
    list.push(r);
    byCompany.set(r.companyKey, list);
  }
  const rows: CompanyRow[] = [];
  let hiddenCompanies = 0;
  let hiddenCandidates = 0;
  for (const [key, list] of byCompany) {
    if (list.length < min) {
      hiddenCompanies++;
      hiddenCandidates += list.length;
      continue;
    }
    const p = companies.get(key);
    const places = top(list.map(r => r.place || [r.city, r.region].filter(Boolean).join(', ')).filter(Boolean), 3);
    rows.push({
      key,
      name: list[0].company,
      industry: list[0].industry,
      count: list.length,
      sites: new Set(list.filter(r => r.lat != null).map(r => `${r.lat!.toFixed(2)},${r.lng!.toFixed(2)}`)).size,
      topFamily: top(list.map(r => r.family), 1)[0]?.name ?? '',
      topSkills: top(list.flatMap(r => r.skills), 5).map(s => s.name),
      places: places.map(p => p.name),
      status: p?.status ?? 'none',
      prospect: Boolean(p?.prospect),
      website: p?.website,
      careers: p?.careers,
      phone: p?.phone,
    });
  }
  rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // Facets come from the whole tenant, so a filter never hides its own options.
  return {
    total: filtered.length,
    mapped: located.length,
    heat,
    points,
    companies: rows,
    hidden: { companies: hiddenCompanies, candidates: hiddenCandidates },
    minCount: min,
    facets: {
      families: top(all.map(r => r.family), 40),
      industries: top(all.map(r => r.industry), 40),
      skills: top(all.flatMap(r => r.skills), 80),
      states: top(all.map(r => r.region ?? '').filter(Boolean), 60),
      companies: top(all.map(r => r.companyKey), 400),
    },
    companyNames: companyNames(all),
  };
}

/** Company names for the company facet, keyed by companyKey. */
export function companyNames(all: TalentRecord[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of all) out[r.companyKey] ??= r.company;
  return out;
}

export function companyDetail(
  key: string,
  filtered: TalentRecord[],
  profile: CompanyProfile | null,
  fallbackName: string,
): CompanyDetail {
  const min = minCount();
  const list = filtered.filter(r => r.companyKey === key);
  const below = list.length < min;
  return {
    profile: profile ?? { key, name: fallbackName, status: 'none' },
    industry: list[0]?.industry ?? '',
    count: below ? 0 : list.length,
    families: below ? [] : top(list.map(r => r.family), 8),
    skills: below ? [] : top(list.flatMap(r => r.skills), 12),
    seniority: below ? [] : top(list.map(r => r.seniority), 6),
    places: below ? [] : top(list.map(r => r.place || [r.city, r.region].filter(Boolean).join(', ')).filter(Boolean), 5),
    candidates: below
      ? []
      : list
          .sort((a, b) => b.resumeDate.localeCompare(a.resumeDate))
          .slice(0, 200)
          .map(r => ({
            id: r.id,
            companyRaw: r.companyRaw ?? r.company,
            title: r.title,
            family: r.family,
            seniority: r.seniority,
            yoe: r.yoe,
            skills: (r.skillsRaw?.length ? r.skillsRaw : r.skills).slice(0, 12),
            place: r.place || [r.city, r.region].filter(Boolean).join(', '),
            resumeDate: r.resumeDate,
          })),
    spellings: below ? [] : [...new Set(list.map(r => r.companyRaw).filter((s): s is string => Boolean(s) && s !== list[0].company))].slice(0, 8),
    belowMinimum: below,
    minCount: min,
  };
}
