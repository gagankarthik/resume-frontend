/**
 * Normalization — the part of the heat map that makes counts mean anything.
 *
 * "JPMC", "JP Morgan" and "JPMorgan Chase & Co" must be one company, and
 * "Sr. Java Dev" and "Software Engineer II" must be one title family, or the
 * "14 developers at this employer" count is noise. Everything here is a pure
 * function over strings so it can be tested and re-run for a backfill.
 *
 * Title families use SOC 2018 / O*NET codes; industries use NAICS. Where a
 * value is inferred rather than looked up, the confidence says so.
 */

import type { Seniority } from './types';

/* ── Company ─────────────────────────────────────────────────────────────── */

const LEGAL_SUFFIX =
  /\b(incorporated|inc|llc|l\.l\.c|ltd|limited|corp|corporation|co|company|plc|lp|llp|pllc|gmbh|ag|sa|pvt|private|holdings?|group|n\.a|na)\b\.?/g;

/** Known companies: every spelling on the left becomes the name and industry on the right. */
const KNOWN: { names: string[]; canonical: string; naics: string }[] = [
  { names: ['jpmc', 'jp morgan', 'jpmorgan', 'jpmorgan chase', 'jp morgan chase', 'chase bank', 'jpmorgan chase bank'], canonical: 'JPMorgan Chase', naics: '522110' },
  { names: ['bofa', 'bank of america', 'bank of america merrill lynch'], canonical: 'Bank of America', naics: '522110' },
  { names: ['wells fargo', 'wellsfargo', 'wells fargo bank'], canonical: 'Wells Fargo', naics: '522110' },
  { names: ['citi', 'citibank', 'citigroup'], canonical: 'Citigroup', naics: '522110' },
  { names: ['huntington', 'huntington bank', 'huntington national bank', 'huntington bancshares'], canonical: 'Huntington Bank', naics: '522110' },
  { names: ['fifth third', 'fifth third bank', '5/3 bank'], canonical: 'Fifth Third Bank', naics: '522110' },
  { names: ['pnc', 'pnc bank', 'pnc financial services'], canonical: 'PNC', naics: '522110' },
  { names: ['capital one', 'capitalone'], canonical: 'Capital One', naics: '522110' },
  { names: ['nationwide', 'nationwide insurance', 'nationwide mutual insurance'], canonical: 'Nationwide', naics: '524126' },
  { names: ['progressive', 'progressive insurance'], canonical: 'Progressive', naics: '524126' },
  { names: ['state farm', 'state farm insurance'], canonical: 'State Farm', naics: '524126' },
  { names: ['allstate'], canonical: 'Allstate', naics: '524126' },
  { names: ['anthem', 'elevance', 'elevance health'], canonical: 'Elevance Health', naics: '524114' },
  { names: ['unitedhealth', 'unitedhealth group', 'uhg', 'optum', 'united healthcare', 'unitedhealthcare'], canonical: 'UnitedHealth Group', naics: '524114' },
  { names: ['cardinal health'], canonical: 'Cardinal Health', naics: '424210' },
  { names: ['cvs', 'cvs health', 'aetna'], canonical: 'CVS Health', naics: '456110' },
  { names: ['amazon', 'aws', 'amazon web services', 'amazon.com'], canonical: 'Amazon', naics: '455110' },
  { names: ['google', 'alphabet', 'google cloud'], canonical: 'Google', naics: '519290' },
  { names: ['microsoft', 'msft', 'microsoft corp'], canonical: 'Microsoft', naics: '513210' },
  { names: ['meta', 'facebook', 'meta platforms'], canonical: 'Meta', naics: '519290' },
  { names: ['apple'], canonical: 'Apple', naics: '334220' },
  { names: ['ibm', 'international business machines'], canonical: 'IBM', naics: '541512' },
  { names: ['oracle'], canonical: 'Oracle', naics: '513210' },
  { names: ['salesforce', 'salesforce.com'], canonical: 'Salesforce', naics: '513210' },
  { names: ['accenture'], canonical: 'Accenture', naics: '541611' },
  { names: ['deloitte', 'deloitte consulting', 'deloitte touche tohmatsu'], canonical: 'Deloitte', naics: '541211' },
  { names: ['ey', 'ernst & young', 'ernst and young', 'ernst young'], canonical: 'EY', naics: '541211' },
  { names: ['pwc', 'pricewaterhousecoopers', 'price waterhouse coopers'], canonical: 'PwC', naics: '541211' },
  { names: ['kpmg'], canonical: 'KPMG', naics: '541211' },
  { names: ['cognizant', 'cognizant technology solutions'], canonical: 'Cognizant', naics: '541512' },
  { names: ['tcs', 'tata consultancy services', 'tata consultancy'], canonical: 'Tata Consultancy Services', naics: '541512' },
  { names: ['infosys', 'infosys technologies'], canonical: 'Infosys', naics: '541512' },
  { names: ['wipro', 'wipro technologies'], canonical: 'Wipro', naics: '541512' },
  { names: ['hcl', 'hcltech', 'hcl technologies'], canonical: 'HCLTech', naics: '541512' },
  { names: ['capgemini'], canonical: 'Capgemini', naics: '541512' },
  { names: ['tech mahindra', 'techm'], canonical: 'Tech Mahindra', naics: '541512' },
  { names: ['ltimindtree', 'larsen & toubro infotech'], canonical: 'LTIMindtree', naics: '541512' },
  { names: ['walmart', 'wal-mart', 'walmart global tech'], canonical: 'Walmart', naics: '455211' },
  { names: ['target'], canonical: 'Target', naics: '455110' },
  { names: ['kroger', 'the kroger'], canonical: 'Kroger', naics: '445110' },
  { names: ['honda', 'american honda', 'honda of america'], canonical: 'Honda', naics: '336110' },
  { names: ['ford', 'ford motor'], canonical: 'Ford', naics: '336110' },
  { names: ['general motors'], canonical: 'General Motors', naics: '336110' },
  { names: ['ohio state university', 'the ohio state university'], canonical: 'The Ohio State University', naics: '611310' },
  { names: ['ohiohealth', 'ohio health'], canonical: 'OhioHealth', naics: '622110' },
  { names: ['cleveland clinic'], canonical: 'Cleveland Clinic', naics: '622110' },
  { names: ['state of ohio', 'ohio department of administrative services', 'ohio das'], canonical: 'State of Ohio', naics: '921110' },
  { names: ['commonwealth of pennsylvania', 'state of pennsylvania'], canonical: 'Commonwealth of Pennsylvania', naics: '921110' },
  { names: ['state of georgia', 'georgia technology authority'], canonical: 'State of Georgia', naics: '921110' },
  { names: ['ocean blue', 'oceanblue', 'ocean blue solutions', 'oceanblue solutions'], canonical: 'Ocean Blue Solutions', naics: '561311' },
];

const KNOWN_INDEX = new Map<string, (typeof KNOWN)[number]>();
for (const k of KNOWN) for (const n of k.names) KNOWN_INDEX.set(cleanCompany(n), k);

function cleanCompany(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[’'`]/g, '')
    .replace(/[.,/#!$%^*;:{}=_~()"[\]\\|<>?]/g, ' ')
    .replace(LEGAL_SUFFIX, ' ')
    .replace(/\band\s*$/g, ' ')
    .replace(/^\s*the\b/, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(s: string): string {
  return s
    .split(' ')
    .map(w => (w.length <= 3 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

export type NormalCompany = { name: string; key: string; naics?: string; confidence: number };

export function normalizeCompany(raw: string | undefined | null): NormalCompany | null {
  if (!raw) return null;
  // "Infosys (Client: Nationwide)" — the employer is the part before the note.
  const primary = raw.split(/\(|\s[-–|]\s|\bclient\s*:/i)[0].trim();
  const cleaned = cleanCompany(primary);
  if (!cleaned || cleaned.length < 2) return null;

  const known = KNOWN_INDEX.get(cleaned);
  if (known) {
    return { name: known.canonical, key: slug(known.canonical), naics: known.naics, confidence: 0.95 };
  }
  const name = titleCase(primary.replace(/\s+/g, ' ').replace(/[,.]\s*(inc|llc|ltd|corp)\.?$/i, '').trim());
  return { name, key: slug(cleaned), confidence: 0.75 };
}

export function slug(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* ── Industry (NAICS) ────────────────────────────────────────────────────── */

export const NAICS_LABEL: Record<string, string> = {
  '522110': 'Banking',
  '524126': 'Insurance',
  '524114': 'Health insurance',
  '524': 'Insurance',
  '522': 'Banking and credit',
  '523': 'Investments and securities',
  '424210': 'Pharmaceutical distribution',
  '456110': 'Pharmacies and health retail',
  '455110': 'Retail',
  '455211': 'Retail',
  '445110': 'Grocery retail',
  '44-45': 'Retail',
  '519290': 'Internet and web services',
  '513210': 'Software publishing',
  '334220': 'Electronics manufacturing',
  '541512': 'IT services and consulting',
  '5415': 'IT services and consulting',
  '541611': 'Management consulting',
  '541211': 'Accounting and advisory',
  '336110': 'Automotive manufacturing',
  '336': 'Transportation equipment manufacturing',
  '611310': 'Higher education',
  '611': 'Education',
  '622110': 'Hospitals',
  '62': 'Health care',
  '921110': 'State and local government',
  '92': 'Public administration',
  '561311': 'Staffing',
  '2211': 'Utilities',
  '48-49': 'Transportation and logistics',
  '517': 'Telecommunications',
  '3254': 'Pharmaceutical manufacturing',
  '481': 'Airlines',
  '31-33': 'Manufacturing',
  '0': 'Unclassified',
};

/**
 * Only signals a person would call certain from the name alone. Anything
 * looser ("Solutions", "Tech", "Group") is left for the resume's own industry
 * or marked Unclassified, rather than guessed.
 */
const INDUSTRY_RULES: [RegExp, string][] = [
  [/\b(bank|bancorp|bancshares|credit union)\b/, '522'],
  [/\b(insurance|assurance|reinsurance)\b/, '524'],
  [/\b(hospital|health system|medical center|clinic)\b/, '62'],
  [/\b(university|college)\b/, '611'],
  [/^(state|county|city|commonwealth) of\b|\bdepartment of\b/, '92'],
  [/\b(staffing|recruiting)\b/, '561311'],
];

export function industryFor(company: NormalCompany | null, hint?: string): { code: string; label: string; confidence: number } {
  if (company?.naics) return { code: company.naics, label: NAICS_LABEL[company.naics] ?? 'Other', confidence: 0.95 };
  const hay = `${company?.name ?? ''}`.toLowerCase();
  for (const [re, code] of INDUSTRY_RULES) {
    if (re.test(hay)) return { code, label: NAICS_LABEL[code], confidence: 0.6 };
  }
  if (hint && hint.trim()) {
    // The industry the extraction engine read from the resume, kept as written.
    return { code: '', label: hint.trim().slice(0, 80), confidence: 0.5 };
  }
  return { code: '0', label: 'Unclassified', confidence: 0.2 };
}

/* ── Title family (SOC 2018 / O*NET) ─────────────────────────────────────── */

export const FAMILIES: { code: string; label: string; re: RegExp }[] = [
  { code: '11-3021', label: 'IT managers', re: /\b(cto|cio|ciso|chief (technology|information)|vp (of )?(engineering|technology|it)|director (of )?(engineering|it|technology|software)|head of (engineering|technology|it)|(it|engineering|development|software) manager|delivery head)\b/ },
  { code: '13-1082', label: 'Project and program managers', re: /\b(project manager|program manager|pmo|scrum master|delivery manager|release manager|agile coach|project lead|project coordinator)\b/ },
  { code: '15-1253', label: 'QA analysts and testers', re: /\b(qa|quality assurance|quality analyst|tester|test (engineer|analyst|lead|automation)|sdet|automation (tester|engineer)|performance test)/ },
  { code: '15-2051', label: 'Data scientists', re: /\b(data scientist|machine learning|ml engineer|ai engineer|deep learning|nlp engineer|mlops)\b/ },
  { code: '15-2051.01', label: 'BI and data analysts', re: /\b(bi (developer|analyst|engineer)|business intelligence|data analyst|reporting analyst|tableau|power ?bi|analytics (engineer|developer))\b/ },
  { code: '15-1243', label: 'Data engineers and architects', re: /\b(data (engineer|architect|modeler|warehouse)|etl|big data|hadoop|spark developer|informatica|snowflake|databricks|database architect)\b/ },
  { code: '15-1242', label: 'Database administrators', re: /\b(dba|database administrator|database engineer|sql (server )?dba)\b/ },
  { code: '15-1212', label: 'Information security analysts', re: /\b(security (analyst|engineer|architect|consultant)|cyber|soc analyst|iam|identity and access|penetration|infosec|vulnerability)\b/ },
  { code: '15-1241', label: 'Network architects and engineers', re: /\b(network (engineer|architect|administrator)|ccna|ccnp|voip engineer|telecom engineer)\b/ },
  { code: '15-1299.08', label: 'Cloud, DevOps and systems engineers', re: /\b(devops|sre|site reliability|cloud (engineer|architect|consultant)|platform engineer|infrastructure (engineer|architect)|solutions? architect|enterprise architect|technical architect|systems? engineer|kubernetes|aws engineer|azure engineer)\b/ },
  { code: '15-1244', label: 'Systems administrators', re: /\b(system(s)? administrator|sysadmin|linux administrator|windows administrator|unix administrator|vmware|middleware administrator)\b/ },
  { code: '15-1232', label: 'IT support specialists', re: /\b(help ?desk|desktop support|service desk|technical support|it support|support (analyst|engineer|specialist))\b/ },
  { code: '15-1255', label: 'UX and digital designers', re: /\b(ux|ui designer|user experience|product designer|interaction designer|visual designer|web designer)\b/ },
  { code: '15-1211', label: 'Systems analysts', re: /\b(systems analyst|business systems analyst|functional (consultant|analyst)|sap|oracle (ebs|apps|functional)|workday|servicenow|salesforce (admin|administrator|consultant)|erp|crm consultant)\b/ },
  { code: '13-1111', label: 'Business analysts', re: /\b(business analyst|ba\b|product owner|requirements analyst|process analyst|management analyst)\b/ },
  { code: '15-1254', label: 'Web developers', re: /\b(web developer|front[- ]?end|frontend|ui developer|angular|react(js)? developer|javascript developer|wordpress)\b/ },
  { code: '15-1252', label: 'Software developers', re: /\b(developer|software engineer|programmer|sde|full[- ]?stack|back[- ]?end|backend|java|\.net|dotnet|python|golang|c\+\+|c#|mainframe|cobol|application engineer|mobile|ios|android|engineer)\b/ },
  { code: '11-9199', label: 'Managers, other', re: /\b(manager|director|head of|vice president|vp)\b/ },
];

const OTHER_FAMILY = { code: '00-0000', label: 'Other roles' };

export function familyFor(title: string | undefined | null): { code: string; label: string; confidence: number } {
  const t = (title ?? '').toLowerCase().replace(/[^a-z0-9+#.\s/-]/g, ' ');
  if (!t.trim()) return { ...OTHER_FAMILY, confidence: 0.1 };
  for (const f of FAMILIES) {
    if (f.re.test(t)) {
      // Generic catch-alls are a match, but a weak one.
      const weak = f.code === '11-9199' || (f.code === '15-1252' && /\bengineer\b/.test(t) && !/software|developer|programmer/.test(t));
      return { code: f.code, label: f.label, confidence: weak ? 0.55 : 0.9 };
    }
  }
  return { ...OTHER_FAMILY, confidence: 0.3 };
}

/* ── Seniority ───────────────────────────────────────────────────────────── */

export function seniorityFor(title: string | undefined | null, yoe: number | null): Seniority {
  const t = (title ?? '').toLowerCase();
  if (/\b(intern|trainee|apprentice|co-?op)\b/.test(t)) return 'Intern';
  if (/\b(manager|director|head of|vp|vice president|chief|cto|cio)\b/.test(t)) return 'Manager';
  if (/\b(lead|principal|staff|architect|distinguished)\b/.test(t)) return 'Lead';
  if (/\b(senior|sr\.?|iii|iv)\b/.test(t)) return 'Senior';
  if (/\b(junior|jr\.?|associate|entry|graduate|i)\b/.test(t) && !/\bii\b/.test(t)) return 'Junior';
  if (yoe == null) return 'Mid';
  if (yoe < 2) return 'Junior';
  if (yoe < 5) return 'Mid';
  if (yoe < 10) return 'Senior';
  return 'Lead';
}

/* ── Years of experience ─────────────────────────────────────────────────── */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

/** Parse the date shapes resumes use into a month index (years * 12 + month). */
export function monthIndex(raw: string | undefined | null, now = new Date()): number | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (/present|current|now|till date|to date|ongoing/.test(s)) return now.getFullYear() * 12 + now.getMonth();
  let m = s.match(/^(\d{4})-(\d{1,2})/);
  if (m) return Number(m[1]) * 12 + Number(m[2]) - 1;
  m = s.match(/^(\d{1,2})[/-](\d{4})$/);
  if (m) return Number(m[2]) * 12 + Number(m[1]) - 1;
  m = s.match(/([a-z]{3,9})\.?\s*,?\s*'?(\d{2,4})/);
  if (m && MONTHS[m[1].slice(0, 3)] !== undefined) {
    const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
    return year * 12 + MONTHS[m[1].slice(0, 3)];
  }
  m = s.match(/\b(19|20)\d{2}\b/);
  if (m) return Number(m[0]) * 12;
  return null;
}

/** Total experience, counting overlapping roles once. */
export function yearsFromRoles(roles: { start?: string; end?: string; current?: boolean }[], now = new Date()): number | null {
  const spans: [number, number][] = [];
  for (const r of roles) {
    const a = monthIndex(r.start, now);
    const b = r.current ? monthIndex('present', now) : monthIndex(r.end, now);
    if (a == null || b == null || b < a) continue;
    spans.push([a, b + 1]);
  }
  if (!spans.length) return null;
  spans.sort((x, y) => x[0] - y[0]);
  let total = 0;
  let [cs, ce] = spans[0];
  for (const [s, e] of spans.slice(1)) {
    if (s <= ce) ce = Math.max(ce, e);
    else {
      total += ce - cs;
      [cs, ce] = [s, e];
    }
  }
  total += ce - cs;
  return Math.round((total / 12) * 10) / 10;
}

/* ── Skills ──────────────────────────────────────────────────────────────── */

const SKILL_ALIASES: Record<string, string> = {
  js: 'JavaScript', javascript: 'JavaScript', ecmascript: 'JavaScript',
  ts: 'TypeScript', typescript: 'TypeScript',
  react: 'React', reactjs: 'React', 'react.js': 'React',
  angular: 'Angular', angularjs: 'Angular', 'angular.js': 'Angular',
  vue: 'Vue', vuejs: 'Vue', 'vue.js': 'Vue',
  node: 'Node.js', nodejs: 'Node.js', 'node.js': 'Node.js',
  java: 'Java', 'core java': 'Java', j2ee: 'Java EE', 'java ee': 'Java EE', jee: 'Java EE',
  spring: 'Spring', 'spring boot': 'Spring Boot', springboot: 'Spring Boot',
  python: 'Python', python3: 'Python', django: 'Django', flask: 'Flask', fastapi: 'FastAPI',
  'c#': 'C#', csharp: 'C#', '.net': '.NET', dotnet: '.NET', 'asp.net': 'ASP.NET', '.net core': '.NET',
  'c++': 'C++', cpp: 'C++', golang: 'Go', go: 'Go', rust: 'Rust', scala: 'Scala', kotlin: 'Kotlin', swift: 'Swift',
  sql: 'SQL', 'pl/sql': 'PL/SQL', plsql: 'PL/SQL', 't-sql': 'T-SQL', tsql: 'T-SQL',
  'sql server': 'SQL Server', mssql: 'SQL Server', 'ms sql': 'SQL Server', 'ms sql server': 'SQL Server',
  postgres: 'PostgreSQL', postgresql: 'PostgreSQL', mysql: 'MySQL', oracle: 'Oracle Database', 'oracle db': 'Oracle Database',
  mongodb: 'MongoDB', mongo: 'MongoDB', cassandra: 'Cassandra', redis: 'Redis', dynamodb: 'DynamoDB',
  aws: 'AWS', 'amazon web services': 'AWS', azure: 'Azure', 'microsoft azure': 'Azure', gcp: 'Google Cloud', 'google cloud': 'Google Cloud',
  k8s: 'Kubernetes', kubernetes: 'Kubernetes', docker: 'Docker', terraform: 'Terraform', ansible: 'Ansible', jenkins: 'Jenkins',
  'ci/cd': 'CI/CD', cicd: 'CI/CD', git: 'Git', github: 'GitHub', gitlab: 'GitLab',
  snowflake: 'Snowflake', databricks: 'Databricks', spark: 'Apache Spark', 'apache spark': 'Apache Spark', pyspark: 'PySpark',
  hadoop: 'Hadoop', kafka: 'Kafka', 'apache kafka': 'Kafka', airflow: 'Airflow', 'apache airflow': 'Airflow', dbt: 'dbt',
  informatica: 'Informatica', ssis: 'SSIS', tableau: 'Tableau', 'power bi': 'Power BI', powerbi: 'Power BI',
  salesforce: 'Salesforce', servicenow: 'ServiceNow', sap: 'SAP', workday: 'Workday', epic: 'Epic',
  selenium: 'Selenium', cypress: 'Cypress', jmeter: 'JMeter', jira: 'Jira', agile: 'Agile', scrum: 'Scrum',
  linux: 'Linux', unix: 'Unix', 'machine learning': 'Machine Learning', ml: 'Machine Learning', tensorflow: 'TensorFlow', pytorch: 'PyTorch',
  mainframe: 'Mainframe', cobol: 'COBOL', 'rest api': 'REST APIs', rest: 'REST APIs', restful: 'REST APIs', microservices: 'Microservices',
};

const SOFT = /\b(communication|team ?work|leadership|problem solving|time management|interpersonal|hard ?working|self[- ]motivated|detail[- ]oriented|collaboration|presentation skills|critical thinking)\b/i;

export function normalizeSkill(raw: string): string | null {
  const s = raw.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  if (!s || s.length > 40 || SOFT.test(s)) return null;
  const key = s.toLowerCase().replace(/\s*(version|v)\s*[\d.]+$/, '').replace(/\s+\d+(\.\d+)*$/, '');
  if (SKILL_ALIASES[key]) return SKILL_ALIASES[key];
  if (/^[a-z]/.test(s) && s === s.toLowerCase()) return s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

export function normalizeSkills(lists: (string | undefined | null)[][], cap = 80): string[] {
  const seen = new Map<string, string>();
  for (const list of lists) {
    for (const raw of list) {
      if (!raw) continue;
      for (const piece of String(raw).split(/[,;|•·]/)) {
        const n = normalizeSkill(piece);
        if (n && !seen.has(n.toLowerCase())) seen.set(n.toLowerCase(), n);
        if (seen.size >= cap) return [...seen.values()];
      }
    }
  }
  return [...seen.values()];
}

/**
 * Every skill exactly as the extraction engine returned it — nothing renamed,
 * nothing dropped except an exact repeat. Comma-joined strings (a role's
 * "key technologies") are split on commas only.
 */
export function rawSkills(lists: (string | undefined | null)[][], cap = 200): string[] {
  const seen = new Map<string, string>();
  for (const list of lists) {
    for (const item of list) {
      if (!item) continue;
      for (const piece of String(item).split(',')) {
        const s = piece.replace(/\s+/g, ' ').trim();
        if (!s || s.length > 120) continue;
        if (!seen.has(s.toLowerCase())) seen.set(s.toLowerCase(), s);
        if (seen.size >= cap) return [...seen.values()];
      }
    }
  }
  return [...seen.values()];
}

/* ── Location ────────────────────────────────────────────────────────────── */

const REMOTE = /^\s*(remote|work from home|wfh|virtual|anywhere|telecommute|n\/a|na)\s*$/i;

/** Tidy a work location for geocoding; null when it is not a place. */
export function placeQuery(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = raw.replace(/\((remote|hybrid|onsite|on-site)\)/gi, '').replace(/\b(remote|hybrid|on-?site)\b\s*[-–/,]?\s*/gi, '').replace(/\s+/g, ' ').trim().replace(/^[,\s-]+|[,\s-]+$/g, '');
  if (!s || REMOTE.test(s) || s.length < 2) return null;
  return s;
}
