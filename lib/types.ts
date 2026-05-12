// ── API Response types (matches validator.py Pydantic models) ────────────────

export interface Address {
  full_address?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface PersonalInformation {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string[];
  phone?: string[];
  address?: Address;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  twitter_url?: string;
  other_urls?: string[];
  date_of_birth?: string;
  nationality?: string;
  gender?: string;
  marital_status?: string;
  profile_headline?: string;
  requisition_number?: string;
}

export interface WorkExperience {
  company_name?: string;
  job_title?: string;
  employment_type?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  duration?: string;
  location?: string;
  remote?: boolean;
  department?: string;
  reporting_to?: string;
  team_size?: number;
  responsibilities?: string[];
  achievements?: string[];
  technologies_used?: string[];
  description?: string;
  // extra fields the LLM may return
  projects?: EmploymentProject[];
  subsections?: Subsection[];
  key_technologies?: string;
}

export interface EmploymentProject {
  projectName?: string;
  clientName?: string;
  projectLocation?: string;
  keyTechnologies?: string;
  projectResponsibilities?: string[];
}

export interface Subsection {
  title?: string;
  content?: string[];
}

export interface Education {
  institution_name?: string;
  degree?: string;
  degree_type?: string;
  field_of_study?: string;
  major?: string;
  minor?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  gpa?: number;
  percentage?: number;
  grade?: string;
  honors?: string[];
  relevant_coursework?: string[];
  thesis_title?: string;
  dissertation?: string;
  location?: string;
  activities?: string[];
  description?: string;
}

export interface Skills {
  all_skills_raw?: string[];
  technical_skills?: string[];
  soft_skills?: string[];
  programming_languages?: string[];
  frameworks_and_libraries?: string[];
  databases?: string[];
  cloud_platforms?: string[];
  tools_and_platforms?: string[];
  operating_systems?: string[];
  methodologies?: string[];
  domain_skills?: string[];
  design_skills?: string[];
  languages_spoken?: string[];
  other_skills?: string[];
  // Free-form passthrough: when the backend extracts the resume's original skill
  // section names (e.g. "Cloud Datawarehouse", "Data Modeling Tool"), it can return
  // them here and the frontend will render them verbatim instead of the fixed
  // category names above.
  categories?: { name?: string; skills?: string[] }[];
}

export interface Certification {
  name?: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
}

export interface Project {
  name?: string;
  description?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  technologies?: string[];
  url?: string;
  repository_url?: string;
  highlights?: string[];
  team_size?: number;
  type?: string;
}

export interface Publication {
  title?: string;
  authors?: string[];
  publisher?: string;
  journal?: string;
  conference?: string;
  date?: string;
  url?: string;
  doi?: string;
  isbn?: string;
  description?: string;
  type?: string;
}

export interface Award {
  title?: string;
  issuer?: string;
  date?: string;
  description?: string;
  level?: string;
}

export interface VolunteerExperience {
  organization?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  location?: string;
  description?: string;
  responsibilities?: string[];
  cause?: string;
}

export interface Language {
  language?: string;
  proficiency?: string;
  reading?: string;
  writing?: string;
  speaking?: string;
}

export interface Reference {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  available_on_request?: boolean;
}

export interface Patent {
  title?: string;
  patent_number?: string;
  date?: string;
  description?: string;
  status?: string;
  inventors?: string[];
  url?: string;
}

export interface Membership {
  organization?: string;
  role?: string;
  membership_type?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface Conference {
  title?: string;
  event?: string;
  date?: string;
  location?: string;
  description?: string;
  url?: string;
  type?: string;
}

export interface Course {
  name?: string;
  provider?: string;
  platform?: string;
  date?: string;
  url?: string;
  credential_id?: string;
  duration?: string;
}

export interface Training {
  name?: string;
  provider?: string;
  date?: string;
  duration?: string;
  description?: string;
}

export interface ExtracurricularActivity {
  organization?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface Analytics {
  total_years_of_experience?: number;
  total_months_of_experience?: number;
  career_level?: string;
  primary_industry?: string;
  secondary_industries?: string[];
  job_functions?: string[];
  highest_education_level?: string;
  number_of_companies?: number;
  number_of_roles?: number;
  average_tenure_months?: number;
  has_international_experience?: boolean;
  primary_location?: string;
  salary_mentioned?: string;
  resume_language?: string;
}

export interface RawSections {
  section_names_found?: string[];
  unclassified_content?: string;
}

export interface Metadata {
  filename?: string;
  file_type?: string;
  page_count?: number;
  model?: string;
  token_usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  cost?: number;
  processing_time_seconds?: number;
  client_id?: string;
  project_id?: string;
  [key: string]: unknown;
}

export interface APIResponse {
  personal_information?: PersonalInformation;
  professional_summary?: string;
  objective?: string;
  work_experience?: WorkExperience[];
  education?: Education[];
  skills?: Skills;
  certifications?: Certification[];
  projects?: Project[];
  publications?: Publication[];
  awards_and_honors?: Award[];
  volunteer_experience?: VolunteerExperience[];
  languages?: Language[];
  interests_and_hobbies?: string[];
  references?: Reference[];
  patents?: Patent[];
  professional_memberships?: Membership[];
  conferences_and_talks?: Conference[];
  courses?: Course[];
  training?: Training[];
  extracurricular_activities?: ExtracurricularActivity[];
  analytics?: Analytics;
  raw_sections?: RawSections;
  _metadata?: Metadata;
}

// ── Ohio / PA format types ────────────────────────────────────────────────────

export interface OhioEducationEntry {
  degree?: string;
  areaOfStudy?: string;
  school?: string;
  date?: string;
  location?: string;
  wasAwarded?: boolean;
}

export interface OhioCertificationEntry {
  name?: string;
  issuedBy?: string;
  dateObtained?: string;
  expirationDate?: string;
  certificationNumber?: string;
}

export interface OhioProjectEntry {
  projectName?: string;
  clientName?: string;
  projectLocation?: string;
  keyTechnologies?: string;
  projectResponsibilities: string[];
}

export interface OhioSubsection {
  title?: string;
  content: string[];
}

export interface OhioEmploymentEntry {
  companyName?: string;
  workPeriod?: string;
  roleName?: string;
  location?: string;
  department?: string;
  subRole?: string;
  description?: string;
  responsibilities: string[];
  projects?: OhioProjectEntry[];
  subsections?: OhioSubsection[];
  keyTechnologies?: string;
}

export interface SkillSubCategory {
  name?: string;
  skills: string[];
}

export interface SkillCategory {
  categoryName?: string;
  skills: string[];
  subCategories?: SkillSubCategory[];
}

export interface TokenStats {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  cost?: number;
}

export interface SimpleProject {
  name?: string;
  description?: string;
  role?: string;
  technologies?: string[];
  highlights?: string[];
  date?: string;
}

export interface ResumeData {
  // display info
  name?: string;
  title?: string;
  requisitionNumber?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
  tokenStats?: TokenStats;
  // sections
  education?: OhioEducationEntry[];
  certifications?: OhioCertificationEntry[];
  employmentHistory?: OhioEmploymentEntry[];
  projects?: SimpleProject[];
  professionalSummary?: string[];
  summarySections?: OhioSubsection[];
  subsections?: OhioSubsection[];
  technicalSkills?: Record<string, string[] | string>;
  skillCategories?: SkillCategory[];
}
