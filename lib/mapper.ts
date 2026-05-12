import type {
  APIResponse,
  ResumeData,
  OhioEducationEntry,
  OhioCertificationEntry,
  OhioEmploymentEntry,
  SimpleProject,
  SkillCategory,
  TokenStats,
  AwardEntry,
  PublicationEntry,
  LanguageEntry,
  VolunteerEntry,
  PatentEntry,
  MembershipEntry,
  ConferenceEntry,
  CourseEntry,
  TrainingEntry,
  ReferenceEntry,
} from './types';
import { splitProseToBullets } from '@/formatters/shared/utils';

// Build a "Start – End" period string when both dates are present.
function buildPeriod(start?: string, end?: string, isCurrent?: boolean): string | undefined {
  const s = (start ?? '').trim();
  const e = isCurrent ? 'Present' : (end ?? '').trim();
  if (!s && !e) return undefined;
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

function buildWorkPeriod(start?: string, end?: string, isCurrent?: boolean): string {
  const s = start ?? '';
  const e = isCurrent ? 'Till date' : (end ?? 'Till date');
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

export function mapToResumeData(api: APIResponse): ResumeData {
  const pi = api.personal_information;

  // token stats from _metadata
  const meta = api._metadata;
  const tokenStats: TokenStats | undefined = meta ? {
    promptTokens: meta.token_usage?.prompt_tokens,
    completionTokens: meta.token_usage?.completion_tokens,
    totalTokens: meta.token_usage?.total_tokens,
    cost: typeof meta.cost === 'number' ? meta.cost : undefined,
  } : undefined;

  // education
  const education: OhioEducationEntry[] = (api.education ?? []).map(e => ({
    degree: e.degree ?? e.degree_type,
    areaOfStudy: e.field_of_study ?? e.major,
    school: e.institution_name,
    date: e.end_date ?? e.start_date,
    location: e.location,
    wasAwarded: e.is_current ? false : !!e.end_date,
  }));

  // certifications
  const certifications: OhioCertificationEntry[] = (api.certifications ?? []).map(c => ({
    name: c.name,
    issuedBy: c.issuing_organization,
    dateObtained: c.issue_date,
    expirationDate: c.expiry_date,
    certificationNumber: c.credential_id,
  }));

  // employment history
  const employmentHistory: OhioEmploymentEntry[] = (api.work_experience ?? []).map(w => {
    const extra = w as Record<string, unknown>;

    // Combine bullets from responsibilities + achievements. If both are empty,
    // promote `description` into responsibilities (sentence-split) so the editor
    // and previews both see populated entries — the LLM often parks duty text
    // in description for prose-style job entries.
    const combined = [
      ...(w.responsibilities ?? []),
      ...(w.achievements ?? []),
    ].filter(r => r && r.trim());

    let responsibilities: string[];
    let description: string | undefined;
    if (combined.length > 0) {
      responsibilities = combined;
      description = w.description;
    } else if (w.description && w.description.trim()) {
      responsibilities = splitProseToBullets(w.description);
      description = undefined; // moved into responsibilities to avoid duplication
    } else {
      responsibilities = [];
      description = w.description;
    }

    return {
      companyName: w.company_name,
      workPeriod: buildWorkPeriod(w.start_date, w.end_date, w.is_current),
      roleName: w.job_title,
      location: w.location,
      department: w.department,
      description,
      responsibilities,
      keyTechnologies: w.technologies_used?.join(', '),
      projects: Array.isArray(extra.projects) ? (extra.projects as Record<string, unknown>[]).map(p => ({
        projectName: String(p.projectName ?? p.name ?? ''),
        clientName: p.clientName ? String(p.clientName) : undefined,
        projectLocation: p.projectLocation ? String(p.projectLocation) : undefined,
        keyTechnologies: p.keyTechnologies ? String(p.keyTechnologies) : undefined,
        projectResponsibilities: Array.isArray(p.projectResponsibilities)
          ? (p.projectResponsibilities as string[])
          : [],
      })) : undefined,
      subsections: Array.isArray(extra.subsections) ? (extra.subsections as Record<string, unknown>[]).map(s => ({
        title: s.title ? String(s.title) : undefined,
        content: Array.isArray(s.content) ? (s.content as string[]) : [],
      })) : undefined,
    };
  });

  // professional summary
  const rawSummary = api.professional_summary ?? api.objective ?? '';
  const professionalSummary: string[] = rawSummary ? [rawSummary] : [];

  // skills — build as skillCategories if structured, else technicalSkills
  const skills = api.skills;
  let technicalSkills: Record<string, string[] | string> | undefined;
  let skillCategories: SkillCategory[] | undefined;

  if (skills) {
    const cats: SkillCategory[] = [];

    const addCat = (name: string, arr?: string[]) => {
      if (!arr || arr.length === 0) return;
      const clean = arr.map(s => s.trim()).filter(Boolean);
      if (clean.length > 0) cats.push({ categoryName: name, skills: clean });
    };

    // Prefer the free-form `categories` passthrough when the backend supplies it —
    // that preserves the resume's original section names (e.g. "Cloud Datawarehouse").
    if (Array.isArray(skills.categories) && skills.categories.length > 0) {
      skills.categories.forEach(c => addCat(c?.name ?? 'Skills', c?.skills));
    }

    // If verbatim categories produced nothing usable (missing, empty arrays, or
    // all-empty skill lists), fall back to the fixed Pydantic fields so the
    // Technical Skills section still renders.
    if (cats.length === 0) {
      addCat('Programming Languages', skills.programming_languages);
      addCat('Frameworks & Libraries', skills.frameworks_and_libraries);
      addCat('Databases', skills.databases);
      addCat('Cloud Platforms', skills.cloud_platforms);
      addCat('Tools & Platforms', skills.tools_and_platforms);
      addCat('Operating Systems', skills.operating_systems);
      addCat('Methodologies', skills.methodologies);
      addCat('Domain Skills', skills.domain_skills);
      addCat('Design Skills', skills.design_skills);
      addCat('Soft Skills', skills.soft_skills);
      addCat('Other Skills', skills.other_skills);
    }

    if (cats.length > 0) {
      skillCategories = cats;
    } else {
      // Last-resort flat fallbacks so SOMETHING shows when the LLM puts everything
      // in a single union field instead of per-category arrays.
      const flat =
        (skills.all_skills_raw && skills.all_skills_raw.length > 0 && skills.all_skills_raw) ||
        (skills.technical_skills && skills.technical_skills.length > 0 && skills.technical_skills) ||
        null;
      if (flat) technicalSkills = { 'Skills': flat };
    }
  }

  const title = pi?.profile_headline
    ?? api.work_experience?.[0]?.job_title
    ?? undefined;

  // ── Supplemental sections ─────────────────────────────────────────────
  // Each maps directly from the API arrays. Empty arrays become undefined
  // so the frontend's "render only if data exists" guards remain accurate.
  const orEmpty = <T>(arr: T[] | undefined): T[] | undefined =>
    (arr && arr.length > 0) ? arr : undefined;

  const awards: AwardEntry[] | undefined = orEmpty(
    (api.awards_and_honors ?? []).map(a => ({
      title: a.title, issuer: a.issuer, date: a.date, description: a.description,
    })),
  );

  const publications: PublicationEntry[] | undefined = orEmpty(
    (api.publications ?? []).map(p => ({
      title: p.title, publisher: p.publisher, journal: p.journal,
      date: p.date, url: p.url, description: p.description,
    })),
  );

  const languagesSpoken: LanguageEntry[] | undefined = orEmpty(
    (api.languages ?? []).map(l => ({ language: l.language, proficiency: l.proficiency })),
  );

  const volunteerExperience: VolunteerEntry[] | undefined = orEmpty(
    (api.volunteer_experience ?? []).map(v => ({
      organization: v.organization, role: v.role,
      period: buildPeriod(v.start_date, v.end_date, v.is_current),
      location: v.location, description: v.description,
      responsibilities: v.responsibilities,
    })),
  );

  const patents: PatentEntry[] | undefined = orEmpty(
    (api.patents ?? []).map(p => ({
      title: p.title, patentNumber: p.patent_number, date: p.date, description: p.description,
    })),
  );

  const memberships: MembershipEntry[] | undefined = orEmpty(
    (api.professional_memberships ?? []).map(m => ({
      organization: m.organization, role: m.role,
      period: buildPeriod(m.start_date, m.end_date, m.is_current),
    })),
  );

  const conferences: ConferenceEntry[] | undefined = orEmpty(
    (api.conferences_and_talks ?? []).map(c => ({
      title: c.title, event: c.event, date: c.date, location: c.location, description: c.description,
    })),
  );

  const courses: CourseEntry[] | undefined = orEmpty(
    (api.courses ?? []).map(c => ({ name: c.name, provider: c.provider, date: c.date })),
  );

  const training: TrainingEntry[] | undefined = orEmpty(
    (api.training ?? []).map(t => ({
      name: t.name, provider: t.provider, date: t.date, description: t.description,
    })),
  );

  const interests: string[] | undefined =
    (api.interests_and_hobbies && api.interests_and_hobbies.length > 0)
      ? api.interests_and_hobbies
      : undefined;

  const references: ReferenceEntry[] | undefined = orEmpty(
    (api.references ?? []).map(r => ({
      name: r.name, title: r.title, company: r.company,
      email: r.email, phone: r.phone, relationship: r.relationship,
    })),
  );

  return {
    name: pi?.full_name,
    title,
    requisitionNumber: pi?.requisition_number,
    email: pi?.email?.[0],
    phone: pi?.phone?.[0],
    linkedin: pi?.linkedin_url ?? undefined,
    github: pi?.github_url ?? undefined,
    location: pi?.address?.city
      ? [pi.address.city, pi.address.state ?? pi.address.country].filter(Boolean).join(', ')
      : pi?.address?.full_address ?? undefined,
    tokenStats,
    education,
    projects: (api.projects ?? []).map((p): SimpleProject => ({
      name: p.name,
      description: p.description,
      role: p.role,
      date: p.end_date ?? p.start_date,
      technologies: p.technologies,
      highlights: p.highlights,
    })),
    certifications,
    employmentHistory,
    professionalSummary,
    technicalSkills,
    skillCategories,
    awards,
    publications,
    languagesSpoken,
    volunteerExperience,
    patents,
    memberships,
    conferences,
    courses,
    training,
    interests,
    references,
  };
}
