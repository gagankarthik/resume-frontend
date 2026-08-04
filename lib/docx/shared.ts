import { LineRuleType, TabStopType, BorderStyle } from 'docx';

// ── String helpers ─────────────────────────────────────────────────────────

export const stripBullet = (t = '') =>
  t.replace(/^[•●◦‣⁃∙·○▪▸\-–—*]\s*/, '').trim();

// Groups consecutive sub-bullets (○ ◦ ▹ ▸ ‣) into a single comma-joined string.
// Main bullets (● • - *) stay as individual items.
export function groupResponsibilities(items: string[]): string[] {
  const SUB_RE = /^[○◦▹▸‣·]\s*/;
  const result: string[] = [];
  let sub: string[] = [];

  const flush = () => {
    if (sub.length) { result.push(sub.join(', ')); sub = []; }
  };

  for (const raw of items) {
    const t = raw.trim();
    if (!t) continue;
    if (SUB_RE.test(t)) {
      sub.push(t.replace(SUB_RE, '').trim());
    } else {
      flush();
      result.push(stripBullet(t));
    }
  }
  flush();
  return result;
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
export const normalizeMonthAbbr = (s = '') => {
  if (typeof s !== 'string') return s;
  return s.replace(MONTH_PATTERN, month => {
    const key = month.toLowerCase().replace(/\.$/, '').slice(0, 3);
    return MONTH_ABBREVIATIONS[key] ?? month;
  });
};

/** Date ranges always use an en dash with spaces, never a bare hyphen. */
export const normalizeDateSeparator = (s = '') =>
  typeof s === 'string' ? s.replace(/\s*[-‐‑–—]+\s*/g, ' – ') : s;

/** A full date range: three-letter months, en-dash separator. */
export const formatDatePeriod = (s = '') => normalizeDateSeparator(normalizeMonthAbbr(s));

export const splitBulletItems = (t = '') => {
  if (!t || typeof t !== 'string') return [t];

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
export const splitProseToBullets = (s = ''): string[] => {
  if (!s) return [];
  return splitBulletItems(s).filter(Boolean);
};

// ── Education sorting ──────────────────────────────────────────────────────

const normalizeDegree = (d = '') => d.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
const degreeRank = (d = '') => {
  const n = normalizeDegree(d);
  const c = n.replace(/\s+/g, '');
  if (/\b(AA|AS|ASSOCIATE)\b/.test(n)) return 1;
  if (/\b(BA|BS|BSC|BACHELOR|BE)\b/.test(n) || /BTECH/.test(c)) return 2;
  if (/\b(MA|MS|MBA|MASTER)\b/.test(n) || /MTECH/.test(c)) return 3;
  if (/\b(PHD|DOCTOR|DOCTORATE|DOCTORAL)\b/.test(n)) return 4;
  return 5;
};

export const sortEducation = <T extends { degree?: string }>(arr: T[]): T[] =>
  arr
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

export function formatLocation(loc = '') {
  const raw = (typeof loc === 'string' ? loc : '').replace(/\s+/g, ' ').trim();
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

export function getEdLocation(loc = '') {
  const raw = (typeof loc === 'string' ? loc : '').replace(/\s+/g, ' ').trim();
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

// ── Project title formatter ────────────────────────────────────────────────

const MONTH_PAT = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

export function formatProjectTitle(proj: Record<string, unknown>, idx: number, total: number) {
  const rawName = (proj.projectName || proj.title || proj.name || proj.projectTitle || '') as string;
  const rawLoc = (proj.projectLocation || '') as string;
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
  if (wasAwarded === undefined) return '-';
  return wasAwarded ? 'Yes' : 'No';
}

// Sub-project display title including the client and location, which were
// extracted but previously never shown in any format.
export function projectTitleWithClient(
  proj: { projectName?: string; clientName?: string; projectLocation?: string },
  fallback: string,
): string {
  const name = (proj.projectName || fallback).trim();
  const client = (proj.clientName ?? '').trim();
  const loc = (proj.projectLocation ?? '').trim();
  let title = name;
  if (client && !name.toLowerCase().includes(client.toLowerCase())) title += ` — Client: ${client}`;
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
