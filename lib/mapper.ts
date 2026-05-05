import type {
  APIResponse,
  ResumeData,
  OhioEducationEntry,
  OhioCertificationEntry,
  OhioEmploymentEntry,
  SkillCategory,
  TokenStats,
} from './types';

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
    return {
      companyName: w.company_name,
      workPeriod: buildWorkPeriod(w.start_date, w.end_date, w.is_current),
      roleName: w.job_title,
      location: w.location,
      department: w.department,
      description: w.description,
      responsibilities: w.responsibilities ?? [],
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
    const add = (name: string, arr?: string[]) => {
      if (arr && arr.length > 0) cats.push({ categoryName: name, skills: arr });
    };
    add('Programming Languages', skills.programming_languages);
    add('Frameworks & Libraries', skills.frameworks_and_libraries);
    add('Databases', skills.databases);
    add('Cloud Platforms', skills.cloud_platforms);
    add('Tools & Platforms', skills.tools_and_platforms);
    add('Technical Skills', skills.technical_skills);
    add('Operating Systems', skills.operating_systems);
    add('Methodologies', skills.methodologies);
    add('Domain Skills', skills.domain_skills);
    add('Design Skills', skills.design_skills);
    add('Soft Skills', skills.soft_skills);
    add('Other Skills', skills.other_skills);

    if (cats.length > 0) {
      skillCategories = cats;
    } else if (skills.all_skills_raw && skills.all_skills_raw.length > 0) {
      technicalSkills = { 'Skills': skills.all_skills_raw };
    }
  }

  const title = pi?.profile_headline
    ?? api.work_experience?.[0]?.job_title
    ?? undefined;

  return {
    name: pi?.full_name,
    title,
    requisitionNumber: pi?.requisition_number,
    tokenStats,
    education,
    certifications,
    employmentHistory,
    professionalSummary,
    technicalSkills,
    skillCategories,
  };
}
