import { LineRuleType, TabStopType, BorderStyle } from 'docx';
import type { OhioEducationEntry } from '@/lib/types';

// ── Input coercion ─────────────────────────────────────────────────────────

/**
 * Anything → the text it should print as.
 *
 * The builders receive a `ResumeData`, but the shape is only a promise: the
 * record travels through localStorage, through an editor that can add and
 * clear rows, and through passthrough fields (a job's `projects` and
 * `subsections`) that the engine hands over exactly as the model wrote them,
 * with no schema between. So a value typed `string` arrives as null, as a
 * number, or as a nested array often enough to matter.
 *
 * It mattered a lot: `.trim()` on one of those threw, the throw escaped the
 * builder, and the recruiter got "The document could not be built. Try again."
 * with no file and nothing to act on. Every value that reaches a TextRun goes
 * through here first, so a bad field costs its own text and nothing else.
 */
export function text(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  if (typeof v === 'boolean') return String(v);
  // A nested list is a list of bullets the model flattened one level too deep.
  if (Array.isArray(v)) return v.map(text).filter(Boolean).join(' ');
  return '';
}

/** Anything → an array of printable strings, blanks dropped. */
export function textList(v: unknown): string[] {
  if (v == null) return [];
  const items = Array.isArray(v) ? v : [v];
  return items.flatMap(item => {
    // Keep a nested list's items separate: they are separate bullets.
    if (Array.isArray(item)) return textList(item);
    const s = text(item).trim();
    return s ? [s] : [];
  });
}

/** Anything → an array of objects safe to read properties off. */
export function objList<T>(v: unknown): T[] {
  return Array.isArray(v)
    ? (v.filter(item => item != null && typeof item === 'object') as T[])
    : [];
}

/**
 * Run a section builder, and give up only that section if it throws.
 *
 * A resume export is not all-or-nothing: a recruiter would far rather have the
 * document with one section marked as unrenderable than no document at all.
 */
export function safely<T>(build: () => T[], fallback: (e: unknown) => T[]): T[] {
  try {
    return build();
  } catch (e) {
     
    console.error('resume section could not be rendered', e);
    return fallback(e);
  }
}

// ── String helpers ─────────────────────────────────────────────────────────

export const stripBullet = (t: unknown = '') =>
  text(t).replace(/^[•●◦‣⁃∙·○▪▸\-–—*]\s*/, '').trim();

/** One responsibility line, and how deeply the source indented it. */
export interface RespItem {
  text: string;
  /** 0 for a main bullet (● • - *), 1 for a sub-bullet (○ ◦ ▹ ▸ ‣). */
  level: 0 | 1;
}

/**
 * Responsibility lines → the bullets that should be rendered, in order.
 *
 * The one definition of "how many bullets does this become", shared by the
 * four DOCX builders and the three previews. When each carried its own, the
 * preview and the file disagreed about it — which is how a bullet list on
 * screen became a comma-spliced paragraph in the document that was submitted.
 */
export function responsibilityBullets(items: unknown): RespItem[] {
  return groupResponsibilities(items).flatMap(item =>
    splitProseToBullets(item.text).map(t => ({ text: stripBullet(t), level: item.level })),
  );
}

/**
 * Responsibility lines → bullets, keeping the source's own nesting.
 *
 * Consecutive sub-bullets used to be joined into one comma-separated string,
 * which turned a nested list the candidate wrote into a run-on sentence. The
 * templates now define a second bullet level, so a sub-bullet renders as an
 * indented bullet and one source line stays one line.
 */
export function groupResponsibilities(items: unknown): RespItem[] {
  const SUB_RE = /^[○◦▹▸‣·]\s*/;
  return textList(items).flatMap((raw): RespItem[] => {
    const t = raw.trim();
    if (!t) return [];
    const level = SUB_RE.test(t) ? 1 : 0;
    const body = level === 1 ? t.replace(SUB_RE, '').trim() : stripBullet(t);
    return body ? [{ text: body, level }] : [];
  });
}

// ── Date formatting ────────────────────────────────────────────────────────

const MONTH_ABBREVIATIONS: Record<string, string> = {
  jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
  jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
};

/**
 * Every spelling of a month a resume might use, with an optional trailing dot.
 * The odd ones matter: "Sept", "Sept.", "Octo" and "JULY" all reach this from
 * real documents, and each used to survive one of the two implementations this
 * replaces.
 */
const MONTH_PATTERN =
  /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sept(?:ember)?|sep|oct(?:ober|o)?|nov(?:ember)?|dec(?:ember)?)\b\.?/gi;

/**
 * Month names to the three-letter form: "July" / "JULY" / "Jul." → "Jul".
 *
 * Always exactly three letters in title case, whatever the source wrote —
 * that consistency is the point, since these land in date columns that read
 * as ragged otherwise. Only the month token is touched; years, separators and
 * everything around them are left alone.
 */
export const normalizeMonthAbbr = (s: unknown = '') => {
  return text(s).replace(MONTH_PATTERN, month => {
    const key = month.toLowerCase().replace(/\.$/, '').slice(0, 3);
    return MONTH_ABBREVIATIONS[key] ?? month;
  });
};

/** Date ranges always use an en dash with spaces, never a bare hyphen. */
export const normalizeDateSeparator = (s: unknown = '') =>
  text(s).replace(/\s*[-‐‑–—]+\s*/g, ' – ');

/** A full date range: three-letter months, en-dash separator. */
export const formatDatePeriod = (s: unknown = '') => normalizeDateSeparator(normalizeMonthAbbr(s));

export const splitBulletItems = (raw: unknown = ''): string[] => {
  const t = text(raw);
  if (!t) return [];

  // 1. Newline-separated bullets (preferred backend format).
  const lines = t.split(/\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.flatMap(splitOnGlyph).map(s => s.replace(/^[•●▪‣◦⁃∙\-\*]\s*/, '').trim()).filter(Boolean);
  }

  // 2. Inline bullet glyphs.
  const byGlyph = splitOnGlyph(t);
  if (byGlyph.length > 1) return byGlyph;

  // 3. Legacy " | " separator.
  const piped = t.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean);
  if (piped.length > 1) return piped;

  // NOTE: no semicolon splitting — semicolons are normal punctuation inside a
  // single bullet and splitting on them chops sentences in half.
  return [t];
};

const splitOnGlyph = (s: string): string[] =>
  s.split(/\s*[•●▪‣◦⁃∙]\s*/).map(p => p.trim()).filter(Boolean);

/**
 * Prose-or-bulleted input → bullet list, using ONLY the separators the source
 * itself wrote: newlines, bullet glyphs, and the legacy " | ".
 *
 * A sentence-splitting pass used to run here, chopping any block over 300
 * characters into one bullet per sentence. It changed the count — one long
 * responsibility became four bullets the candidate never wrote as a list — so
 * it is gone. One source item stays one item.
 */
export const splitProseToBullets = (s: unknown = ''): string[] =>
  splitBulletItems(s).filter(Boolean);

// ── Education sorting ──────────────────────────────────────────────────────

const normalizeDegree = (d: unknown = '') => text(d).toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
const degreeRank = (d: unknown = '') => {
  const n = normalizeDegree(d);
  const c = n.replace(/\s+/g, '');
  if (/\b(AA|AS|ASSOCIATE)\b/.test(n)) return 1;
  if (/\b(BA|BS|BSC|BACHELOR|BE)\b/.test(n) || /BTECH/.test(c)) return 2;
  if (/\b(MA|MS|MBA|MASTER)\b/.test(n) || /MTECH/.test(c)) return 3;
  if (/\b(PHD|DOCTOR|DOCTORATE|DOCTORAL)\b/.test(n)) return 4;
  return 5;
};

/**
 * Education in qualification order: associate, bachelor, master, doctorate.
 *
 * The on-screen preview used to carry its own `sortEducation` that ordered by
 * year, most recent first — the same name, the opposite order — so the preview
 * showed the master's on top and the exported table showed the bachelor's. One
 * implementation now serves both.
 */
export const sortEducation = <T extends { degree?: string } = OhioEducationEntry>(arr: unknown): T[] =>
  objList<T>(arr)
    .map((e, i) => ({ e, i, r: degreeRank(e.degree) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(x => x.e);

// ── Location helpers ───────────────────────────────────────────────────────

const INDIA_STATES = new Set([
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa',
  'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala',
  'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland',
  'odisha', 'orissa', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana',
  'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal', 'delhi', 'ncr',
  'chandigarh', 'puducherry', 'pondicherry', 'jammu and kashmir', 'ladakh', 'lakshadweep',
]);

const US_STATE_ABBREVS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

const US_STATE_NAME_MAP: Record<string, string> = {
  Alabama:'AL', Alaska:'AK', Arizona:'AZ', Arkansas:'AR', California:'CA',
  Colorado:'CO', Connecticut:'CT', Delaware:'DE', Florida:'FL', Georgia:'GA',
  Hawaii:'HI', Idaho:'ID', Illinois:'IL', Indiana:'IN', Iowa:'IA', Kansas:'KS',
  Kentucky:'KY', Louisiana:'LA', Maine:'ME', Maryland:'MD', Massachusetts:'MA',
  Michigan:'MI', Minnesota:'MN', Mississippi:'MS', Missouri:'MO', Montana:'MT',
  Nebraska:'NE', Nevada:'NV', 'New Hampshire':'NH', 'New Jersey':'NJ',
  'New Mexico':'NM', 'New York':'NY', 'North Carolina':'NC', 'North Dakota':'ND',
  Ohio:'OH', Oklahoma:'OK', Oregon:'OR', Pennsylvania:'PA', 'Rhode Island':'RI',
  'South Carolina':'SC', 'South Dakota':'SD', Tennessee:'TN', Texas:'TX',
  Utah:'UT', Vermont:'VT', Virginia:'VA', Washington:'WA', 'West Virginia':'WV',
  Wisconsin:'WI', Wyoming:'WY', 'District of Columbia':'DC',
};

function resolveUSStateAbbrev(seg = '') {
  const u = seg.trim().toUpperCase();
  if (US_STATE_ABBREVS.has(u)) return u;
  const lc = seg.trim().toLowerCase();
  const found = Object.entries(US_STATE_NAME_MAP).find(([name]) => name.toLowerCase() === lc);
  return found ? found[1] : null;
}

export function formatLocation(loc: unknown = '') {
  const raw = text(loc).replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const parts = raw.split(',').map(p => p.trim()).filter(Boolean);

  // Strip pure country/country-code parts so they don't pollute city detection
  const meaningful = parts.filter(p => !/^(united states of america|united states|usa|u\.s\.a?\.)$/i.test(p) && !/^\d+$/.test(p));

  // India
  const hasIndia = meaningful.some(p => /\bindia\b/i.test(p)) || meaningful.some(p => INDIA_STATES.has(p.toLowerCase()));
  if (hasIndia) {
    const city = meaningful.find(p => !(/\bindia\b/i.test(p)) && !INDIA_STATES.has(p.toLowerCase()));
    return city ? `${city}, India` : 'India';
  }

  // US: find state abbrev + city
  let stateAbbrev: string | null = null;
  const otherParts: string[] = [];
  for (const part of meaningful) {
    const a = resolveUSStateAbbrev(part);
    if (a && !stateAbbrev) {
      stateAbbrev = a;
    } else {
      otherParts.push(part);
    }
  }
  if (stateAbbrev) {
    const city = otherParts[0];
    return city ? `${city}, ${stateAbbrev}` : stateAbbrev;
  }

  // Return meaningful parts joined (avoids showing bare "United States")
  return meaningful.join(', ') || raw;
}

export function getEdLocation(loc: unknown = '') {
  const raw = text(loc).replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.some(p => /\bindia\b/i.test(p))) return 'India';
  for (const p of parts) {
    if (/^\d+$/.test(p)) continue;
    const a = resolveUSStateAbbrev(p);
    if (a) return a;
  }
  if (parts.some(p => /\b(united states|usa)\b/i.test(p))) return 'United States';
  return parts[parts.length - 1] || raw;
}

/**
 * A job's location, or nothing when the "location" is a working arrangement.
 *
 * "Remote" in the location column of a submission form reads as a place the
 * candidate is, which it is not.
 */
const NOT_A_PLACE = /^(remote|work from home|wfh|hybrid|on-?site|n\/a)$/i;

export function resolveJobLocation(raw: unknown): string {
  const f = formatLocation(raw);
  return NOT_A_PLACE.test(f.trim()) ? '' : f;
}

// ── Profile URLs ───────────────────────────────────────────────────────────

/** "https://www.linkedin.com/in/jane-doe/" → "linkedin.com/in/jane-doe". */
const shortenUrl = (host: string) => (url: unknown): string => {
  const raw = text(url).trim();
  if (!raw) return '';
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return `${host}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return raw;
  }
};

export const shortenLinkedIn = shortenUrl('linkedin.com');
export const shortenGitHub = shortenUrl('github.com');

/** The contact line every format prints under the name, in one place. */
export function contactLine(data: {
  email?: string; phone?: string; linkedin?: string; github?: string; location?: string;
}): string[] {
  return [
    text(data?.email).trim(),
    text(data?.phone).trim(),
    shortenLinkedIn(data?.linkedin),
    shortenGitHub(data?.github),
    text(data?.location).trim(),
  ].filter(Boolean);
}

// ── Project title formatter ────────────────────────────────────────────────

const MONTH_PAT = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

export function formatProjectTitle(proj: Record<string, unknown>, idx: number, total: number) {
  const rawName = text(proj?.projectName || proj?.title || proj?.name || proj?.projectTitle);
  const rawLoc = text(proj?.projectLocation);
  let clean = rawName.replace(/\s+/g, ' ').trim();
  clean = clean
    .replace(/^\s*project\s*\d*\s*[:\-–—]\s*/i, '')
    .replace(/^\s*project\s*\d+\s+/i, '');
  [
    new RegExp(
      `\\(?\\b${MONTH_PAT}\\.?\\s+\\d{4}\\s*[-–—]\\s*(?:${MONTH_PAT}\\.?\\s+\\d{4}|present|current)\\b\\)?`,
      'gi',
    ),
    /\(?\b\d{4}\s*[-–—]\s*(?:\d{4}|present|current)\b\)?/gi,
  ].forEach(re => { clean = clean.replace(re, ' '); });
  if (rawLoc.trim()) {
    const esc = rawLoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    clean = clean.replace(new RegExp(`\\s*[-–—,:|]?\\s*${esc}\\s*`, 'ig'), ' ');
  }
  clean =
    tidyTitleEdges(clean.replace(/\s{2,}/g, ' ')) ||
    rawName.trim().slice(0, 60) ||
    'Project';
  return total > 1 ? `Project ${idx + 1}: ${clean}` : clean;
}

/**
 * Trim the punctuation left behind after a date or location is cut out of a
 * title, without damaging the title itself.
 *
 * Brackets are the delicate part. They were in the trailing strip set, which
 * meant any title legitimately ending in one lost it: "Serverless Workflow
 * (AWS Lambda + API Gateway)" came out as "...(AWS Lambda + API Gateway" — an
 * unclosed bracket, in the document that gets submitted. They belong in the
 * set only when they are empty or unmatched, which is what the removals above
 * actually leave behind.
 */
function tidyTitleEdges(text: string): string {
  let out = text;

  // "Project X ()" — the bracket held a date or location and nothing else.
  out = out.replace(/\(\s*\)/g, ' ');

  // Separators, but not brackets: those are decided by balance, below.
  out = out.replace(/^[-–—,:|\s]+|[-–—,:|\s]+$/g, '').trim();

  // A bracket left open by a removal inside it, e.g. "Pipeline (Airbyte on".
  const opens = (out.match(/\(/g) ?? []).length;
  const closes = (out.match(/\)/g) ?? []).length;
  if (opens > closes) {
    // Prefer keeping the words: close it rather than cut back to the bracket.
    out = `${out}${')'.repeat(opens - closes)}`;
  } else if (closes > opens) {
    // A stray closer with no opener reads as a typo; drop the extras.
    let excess = closes - opens;
    out = out.replace(/\)/g, m => (excess-- > 0 ? '' : m));
  }

  return out.replace(/\s{2,}/g, ' ').trim();
}

/**
 * How a template shows "was the degree awarded?".
 *
 * Three answers, not two. A resume that never says is answered with the
 * table's own placeholder — printing "No" against a degree the candidate holds
 * is a claim the source document does not make.
 */
export function awardedLabel(wasAwarded: boolean | undefined): string {
  if (typeof wasAwarded !== 'boolean') return '-';
  return wasAwarded ? 'Yes' : 'No';
}

/**
 * A project heading, with the client named only when that adds something.
 *
 * Naming the client is useful for consultancy work — "Project 2: Claims
 * Modernisation — Client: State Farm" says who the work was for. It is noise
 * when the client IS the employer, which is how an in-house project is
 * extracted: the heading came out as "OAG - Order Gen — Client: Office of the
 * Attorney General, State of Texas" directly underneath "Office of the
 * Attorney General, State of Texas".
 */
export function projectHeading(
  proj: { clientName?: string },
  base: string,
  employer: unknown = '',
): string {
  const client = text(proj?.clientName).trim();
  if (!client) return base;
  const seen = (s: string) => s.toLowerCase().includes(client.toLowerCase());
  if (seen(base) || seen(text(employer))) return base;
  return `${base} — Client: ${client}`;
}

// Sub-project display title including the client and location, which were
// extracted but previously never shown in any format.
export function projectTitleWithClient(
  proj: { projectName?: string; clientName?: string; projectLocation?: string },
  fallback: string,
  employer: unknown = '',
): string {
  const name = (text(proj?.projectName).trim() || fallback).trim();
  const loc = text(proj?.projectLocation).trim();
  let title = projectHeading(proj ?? {}, name, employer);
  if (loc && !title.toLowerCase().includes(loc.toLowerCase())) title += ` (${loc})`;
  return title;
}

// ── Shared DOCX spacing / tab constants ───────────────────────────────────

export const BODY_SPACING = { after: 0, line: 240, lineRule: LineRuleType.AUTO };
export const RIGHT_TAB = { type: TabStopType.RIGHT, position: 10800 };
export const TABLE_BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  space: 0,
  color: 'auto',
};
