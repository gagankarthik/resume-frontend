import { SENIORITIES, type ClientStatus, type Seniority, type TalentFilters } from './types';

/**
 * Filters arrive from the browser as JSON. Take only the fields we know, with
 * the types we expect, and bounded sizes — nothing else reaches a query.
 */

const strs = (v: unknown, max = 50): string[] | undefined =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.length <= 120).slice(0, max) : undefined;
const num = (v: unknown, lo: number, hi: number): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : undefined;

const STATUSES: ClientStatus[] = ['client', 'target', 'former', 'none'];

export function parseFilters(input: unknown): TalentFilters {
  const f = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const radius = f.radius as Record<string, unknown> | undefined;
  const lat = num(radius?.lat, -90, 90);
  const lng = num(radius?.lng, -180, 180);
  const milesV = num(radius?.miles, 1, 500);

  return {
    families: strs(f.families),
    keyword: typeof f.keyword === 'string' ? f.keyword.slice(0, 80) : undefined,
    skills: strs(f.skills, 20),
    skillMatch: f.skillMatch === 'all' ? 'all' : 'any',
    industries: strs(f.industries),
    companies: strs(f.companies, 200),
    states: strs(f.states),
    radius:
      lat != null && lng != null && milesV != null
        ? { lat, lng, miles: milesV, label: typeof radius?.label === 'string' ? radius.label.slice(0, 120) : undefined }
        : undefined,
    seniority: strs(f.seniority)?.filter((s): s is Seniority => (SENIORITIES as string[]).includes(s)),
    yoeMin: num(f.yoeMin, 0, 60),
    yoeMax: num(f.yoeMax, 0, 60),
    months: num(f.months, 1, 240),
    minConfidence: num(f.minConfidence, 0, 1),
    clientStatus: strs(f.clientStatus)?.filter((s): s is ClientStatus => (STATUSES as string[]).includes(s)),
    prospectsOnly: f.prospectsOnly === true,
  };
}

export function filtersFromQuery(url: URL): TalentFilters {
  const raw = url.searchParams.get('f');
  if (!raw) return {};
  try {
    return parseFilters(JSON.parse(raw));
  } catch {
    return {};
  }
}
