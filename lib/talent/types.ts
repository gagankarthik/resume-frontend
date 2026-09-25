/**
 * Talent Heat Map — shared types.
 *
 * A talent record is what one parsed resume contributes to the map. It holds
 * the candidate's current employer, role and skills, plotted at the
 * employer's work location. It deliberately holds nothing that names or
 * reaches the candidate: no name, email, phone, or home address. Repeat
 * uploads of the same person are recognised by a one-way fingerprint.
 */

export type Seniority = 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager';
export const SENIORITIES: Seniority[] = ['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Manager'];

export type ClientStatus = 'client' | 'target' | 'former' | 'none';
export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  client: 'Active client',
  target: 'Target',
  former: 'Former client',
  none: 'Not engaged',
};

export type LocationSource = 'role' | 'company-office' | 'none';

/** Which product sent the resume to the extraction engine (hire, website, …). */
export const sourceLabel = (s?: string) =>
  ({ hire: 'Hire', website: 'Website applications', matching: 'Matching' })[s ?? ''] ?? 'Other products';

export type TalentRecord = {
  /** One-way fingerprint of the candidate; the record's id within a tenant. */
  id: string;
  /** The employer exactly as written on the resume. */
  companyRaw: string;
  /** The normalized employer, used to group spellings of one company. */
  company: string;
  companyKey: string;
  industryCode: string;
  industry: string;
  title: string;
  familyCode: string;
  family: string;
  seniority: Seniority;
  yoe: number | null;
  /** Skills in canonical spelling, for filters and counts. */
  skills: string[];
  /** Every skill exactly as extracted. */
  skillsRaw: string[];
  /** The work location as written on the resume, e.g. "Columbus, OH". */
  place: string;
  city?: string;
  region?: string;
  postal?: string;
  country?: string;
  lat?: number;
  lng?: number;
  locSource: LocationSource;
  /** When the resume was processed. Drives freshness filters. */
  resumeDate: string;
  updatedAt: string;
  /** Where the resume came from: an upload in Hire, or a job application on the website. */
  source?: string;
  /** 0–1. Blends parse coverage with how confidently each field was normalized. */
  confidence: number;
  fieldConfidence: { company: number; family: number; industry: number; location: number };
};

export type CompanyProfile = {
  key: string;
  name: string;
  status: ClientStatus;
  website?: string;
  careers?: string;
  phone?: string;
  prospect?: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

export type Mode = 'recruiting' | 'sales';

export type TalentFilters = {
  families?: string[];
  keyword?: string;
  skills?: string[];
  skillMatch?: 'any' | 'all';
  industries?: string[];
  companies?: string[];
  states?: string[];
  radius?: { lat: number; lng: number; miles: number; label?: string };
  seniority?: Seniority[];
  yoeMin?: number;
  yoeMax?: number;
  /** Only resumes processed within this many months. */
  months?: number;
  minConfidence?: number;
  clientStatus?: ClientStatus[];
  prospectsOnly?: boolean;
};

export type CountItem = { name: string; count: number };

/** One employer at one site, as plotted. */
export type CompanyPoint = {
  key: string;
  /** companyKey + rounded location, so one company's offices plot apart. */
  siteKey: string;
  name: string;
  industry: string;
  place: string;
  lat: number;
  lng: number;
  count: number;
  topFamilies: CountItem[];
  topSkills: CountItem[];
  status: ClientStatus;
  prospect: boolean;
};

export type HeatCell = { lat: number; lng: number; count: number };

export type CompanyRow = {
  key: string;
  name: string;
  industry: string;
  count: number;
  sites: number;
  topFamily: string;
  topSkills: string[];
  places: string[];
  status: ClientStatus;
  prospect: boolean;
  website?: string;
  careers?: string;
  phone?: string;
};

export type MapResponse = {
  total: number;
  mapped: number;
  heat: HeatCell[];
  points: CompanyPoint[];
  companies: CompanyRow[];
  hidden: { companies: number; candidates: number };
  minCount: number;
  facets: {
    families: CountItem[];
    industries: CountItem[];
    skills: CountItem[];
    states: CountItem[];
    /** Keyed by companyKey; display names are in `companyNames`. */
    companies: CountItem[];
  };
  companyNames: Record<string, string>;
};

/** What a company card shows behind a click. Candidate rows carry no identity. */
export type CompanyDetail = {
  profile: CompanyProfile;
  industry: string;
  count: number;
  families: CountItem[];
  skills: CountItem[];
  seniority: CountItem[];
  places: CountItem[];
  candidates: {
    id: string;
    companyRaw: string;
    title: string;
    family: string;
    seniority: Seniority;
    yoe: number | null;
    skills: string[];
    place: string;
    resumeDate: string;
  }[];
  /** Other spellings of this employer found on resumes, e.g. "JPMC". */
  spellings: string[];
  belowMinimum: boolean;
  minCount: number;
};
