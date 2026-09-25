import { createHmac, randomUUID } from 'node:crypto';
import type { APIResponse, WorkExperience } from '@/lib/types';
import type { TalentRecord } from './types';
import {
  familyFor,
  industryFor,
  monthIndex,
  normalizeCompany,
  normalizeSkills,
  placeQuery,
  rawSkills,
  seniorityFor,
  yearsFromRoles,
} from './normalize';

/**
 * Turn one parsed resume into one talent record.
 *
 * The parsed resume arrives with everything the candidate wrote. This is the
 * point where it is reduced to what the map needs. Name, email, phone and home
 * address are read only to compute the fingerprint and are never returned.
 */

function fingerprintSecret(): string {
  const s = process.env.NEXT_TALENT_FINGERPRINT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_TALENT_FINGERPRINT_SECRET is not set.');
  }
  return 'local-development-only';
}

/**
 * A keyed, one-way id for "this person". The same candidate uploaded twice
 * gets the same id, so they are counted once; the id cannot be turned back
 * into an email or phone number without the server's secret.
 */
export function fingerprint(tenant: string, api: APIResponse): string {
  const p = api.personal_information ?? {};
  const email = (p.email ?? []).map(e => e.trim().toLowerCase()).find(e => e.includes('@'));
  const phone = (p.phone ?? []).map(n => n.replace(/\D/g, '').slice(-10)).find(n => n.length >= 10);
  const name = (p.full_name ?? [p.first_name, p.last_name].filter(Boolean).join(' ')).trim().toLowerCase();

  const basis = email ? `e:${email}` : phone ? `p:${phone}` : name ? `n:${name}` : null;
  if (!basis) return `x${randomUUID().replace(/-/g, '').slice(0, 24)}`;
  return createHmac('sha256', fingerprintSecret()).update(`${tenant}|${basis}`).digest('hex').slice(0, 32);
}

/** The candidate's current role: marked current, else the latest end date, else the first listed. */
export function currentRole(roles: WorkExperience[] | undefined): WorkExperience | null {
  const list = (roles ?? []).filter(r => r && (r.company_name || r.job_title));
  if (!list.length) return null;
  const current = list.find(r => r.is_current || /present|current|now|till date/i.test(r.end_date ?? ''));
  if (current) return current;
  let best = list[0];
  let bestEnd = monthIndex(best.end_date) ?? -1;
  for (const r of list.slice(1)) {
    const e = monthIndex(r.end_date) ?? -1;
    if (e > bestEnd) {
      best = r;
      bestEnd = e;
    }
  }
  return best;
}

export type DraftRecord = Omit<TalentRecord, 'lat' | 'lng' | 'city' | 'region' | 'postal' | 'country' | 'locSource'> & {
  query: string | null;
};

export function buildTalentRecord(tenant: string, api: APIResponse, now = new Date()): DraftRecord | null {
  const role = currentRole(api.work_experience);
  if (!role) return null;

  const company = normalizeCompany(role.company_name);
  if (!company) return null;

  const title = (role.job_title ?? '').trim() || 'Untitled role';
  const family = familyFor(title);
  const industry = industryFor(company, api.analytics?.primary_industry);

  const yoe =
    typeof api.analytics?.total_years_of_experience === 'number' && api.analytics.total_years_of_experience > 0
      ? Math.round(api.analytics.total_years_of_experience * 10) / 10
      : yearsFromRoles(
          (api.work_experience ?? []).map(r => ({ start: r.start_date, end: r.end_date, current: r.is_current })),
          now,
        );

  const s = api.skills ?? {};
  const skillLists: (string | undefined | null)[][] = [
    s.technical_skills ?? [],
    s.programming_languages ?? [],
    s.frameworks_and_libraries ?? [],
    s.databases ?? [],
    s.cloud_platforms ?? [],
    s.tools_and_platforms ?? [],
    ...(s.categories ?? []).map(c => c.skills ?? []),
    role.technologies_used ?? [],
    (role.key_technologies ?? '').split(','),
    s.all_skills_raw ?? [],
    s.soft_skills ?? [],
    s.domain_skills ?? [],
    s.methodologies ?? [],
    s.operating_systems ?? [],
    s.design_skills ?? [],
    s.other_skills ?? [],
  ];
  const skills = normalizeSkills(skillLists);
  const skillsRaw = rawSkills(skillLists);

  // Where the work happens: the current role's site, else a project site on it.
  // The candidate's home address is never read here.
  const query =
    placeQuery(role.location) ??
    placeQuery((role.projects ?? []).map(p => p.projectLocation).find(Boolean)) ??
    null;

  const coverage = api._metadata?.audit?.coverage_percent;
  const parse = typeof coverage === 'number' ? Math.max(0, Math.min(1, coverage / 100)) : 0.8;

  const fieldConfidence = {
    company: company.confidence,
    family: family.confidence,
    industry: industry.confidence,
    location: query ? 0.7 : 0.2,
  };
  const confidence =
    Math.round(
      (parse * 0.4 + fieldConfidence.company * 0.25 + fieldConfidence.family * 0.25 + fieldConfidence.location * 0.1) * 100,
    ) / 100;

  const iso = now.toISOString();
  return {
    id: fingerprint(tenant, api),
    companyRaw: (role.company_name ?? '').trim(),
    company: company.name,
    companyKey: company.key,
    industryCode: industry.code,
    industry: industry.label,
    title,
    familyCode: family.code,
    family: family.label,
    seniority: seniorityFor(title, yoe),
    yoe,
    skills,
    skillsRaw,
    place: (role.location ?? '').trim() || (query ?? ''),
    query,
    resumeDate: iso,
    updatedAt: iso,
    confidence,
    fieldConfidence,
  };
}
