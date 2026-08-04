import type {
  APIResponse,
  ResumeData,
  OhioEducationEntry,
  OhioCertificationEntry,
  OhioEmploymentEntry,
  SimpleProject,
  SkillCategory,
  TokenStats,
  PatentEntry,
  ConferenceEntry,
  CourseEntry,
  TrainingEntry,
  ReferenceEntry,
} from './types';
import { normalizeMonthAbbr } from './docx/shared';

/** Every way a resume writes "this job is ongoing". */
const ONGOING_END_DATE = /^(present|present day|current|currently|till\s*date|to\s*date|now|ongoing|date)$/i;

/**
 * "Start – End" for a job, with two normalisations applied consistently across
 * every format:
 *
 *   • month names shortened to three letters — "July 2019" → "Jul 2019";
 *   • any ongoing end token collapsed to a single "Till Date", so one resume
 *     saying "Present" and the next saying "Current" render identically.
 *
 * A job with no end date and no is_current flag keeps a blank end rather than
 * being labelled ongoing — that the resume simply did not say.
 */
function buildWorkPeriod(start?: string, end?: string, isCurrent?: boolean): string {
  const s = normalizeMonthAbbr((start ?? '').trim());
  const rawEnd = (end ?? '').trim();
  const e = isCurrent || ONGOING_END_DATE.test(rawEnd)
    ? 'Till Date'
    : normalizeMonthAbbr(rawEnd);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

/**
 * The candidate's name, exactly as the resume prints it.
 *
 * An ALL CAPS name used to be converted to Title Case here. "JOHN SMITH" is
 * how that candidate writes their name; re-casing it is a change to their
 * name, and the tool's job is to reproduce the document, not restyle it.
 * Rebuilding a missing full_name from first_name + last_name is kept — that
 * recovers text the resume does contain rather than altering it.
 */
function formatName(pi?: APIResponse['personal_information']): string | undefined {
  let name = (pi?.full_name ?? '').trim();
  const composed = [pi?.first_name, pi?.last_name].filter(Boolean).join(' ').trim();
  if (!name || (!name.includes(' ') && composed.includes(' '))) {
    name = composed || name;
  }
  return name || undefined;
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

  // education — the degree exactly as the resume writes it. This used to prefer
  // the standardized abbreviation, printing "BS" over the candidate's own
  // "Bachelor of Science in Computer Engineering". degree_type is now only the
  // fallback for when no verbatim degree text was found.
  const education: OhioEducationEntry[] = (api.education ?? []).map(e => ({
    degree: e.degree ?? e.degree_type,
    areaOfStudy: e.field_of_study ?? e.major,
    school: e.institution_name,
    date: normalizeMonthAbbr(e.end_date ?? e.start_date ?? '') || undefined,
    location: e.location,
    // Tri-state on purpose. This was `!!e.end_date`, which turned "the resume
    // never gave an end date" into "the degree was not awarded" — a claim the
    // resume does not make, printed as "No" on a submitted document. A degree
    // still in progress is a real No; a missing date is simply unknown, and
    // the templates render that as "-".
    wasAwarded: e.is_current ? false : e.end_date ? true : undefined,
  }));

  // certifications
  const certifications: OhioCertificationEntry[] = (api.certifications ?? []).map(c => ({
    name: c.name,
    issuedBy: c.issuing_organization,
    dateObtained: normalizeMonthAbbr(c.issue_date ?? '') || undefined,
    expirationDate: normalizeMonthAbbr(c.expiry_date ?? '') || undefined,
    certificationNumber: c.credential_id,
  }));

  // employment history
  const employmentHistory: OhioEmploymentEntry[] = (api.work_experience ?? []).map(w => {
    const extra = w as Record<string, unknown>;

    // Combine bullets from responsibilities + achievements. `description` is
    // intentionally NOT promoted into the bullet list — if the parser only
    // returned prose narrative, the job renders without a Responsibilities block.
    const responsibilities = [
      ...(w.responsibilities ?? []),
      ...(w.achievements ?? []),
    ].filter(r => r && r.trim());

    return {
      companyName: w.company_name,
      workPeriod: buildWorkPeriod(w.start_date, w.end_date, w.is_current),
      roleName: w.job_title,
      location: w.location,
      department: w.department,
      description: w.description,
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

  // Title / Role is supplied by the recruiter, exactly like the requisition
  // number beside it. It is never derived from the resume: the old fallback
  // chain took the most recent job_title and printed it as the candidate's
  // current title, which is a claim the document does not make.
  const title = pi?.title_role || undefined;

  // ── Supplemental sections ─────────────────────────────────────────────
  // Each maps directly from the API arrays. Empty arrays become undefined
  // so the frontend's "render only if data exists" guards remain accurate.
  //
  // Awards, publications, languages, volunteer experience, memberships and
  // interests are not mapped — the engine no longer extracts them and no
  // format renders them.
  const orEmpty = <T>(arr: T[] | undefined): T[] | undefined =>
    (arr && arr.length > 0) ? arr : undefined;

  const patents: PatentEntry[] | undefined = orEmpty(
    (api.patents ?? []).map(p => ({
      title: p.title, patentNumber: p.patent_number, date: p.date, description: p.description,
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

  const references: ReferenceEntry[] | undefined = orEmpty(
    (api.references ?? []).map(r => ({
      name: r.name, title: r.title, company: r.company,
      email: r.email, phone: r.phone, relationship: r.relationship,
    })),
  );

  return {
    name: formatName(pi),
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
    patents,
    conferences,
    courses,
    training,
    references,
  };
}
