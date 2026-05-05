import { LineRuleType, TabStopType, HeightRule, AlignmentType, WidthType, ShadingType, VerticalAlign, BorderStyle } from 'docx';
import type { ResumeData } from '@/lib/types';

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

export const normalizeMonthAbbr = (s = '') => {
  if (typeof s !== 'string') return s;
  const map: Record<string, string> = {
    january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
    june: 'Jun', july: 'Jul', august: 'Aug',
    september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
    sept: 'Sep', octo: 'Oct',
  };
  return s.replace(
    /\b(january|february|march|april|june|july|august|september|october|november|december|sept|octo)\b/gi,
    m => map[m.toLowerCase()] || m,
  );
};

export const splitBulletItems = (t = '') => {
  if (!t || typeof t !== 'string') return [t];
  if (!t.includes('•') && !t.includes(' • ')) return [t];
  return t.split(/\s*[••]\s*/).map(s => s.trim()).filter(Boolean);
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
    clean.replace(/\s{2,}/g, ' ').replace(/^[-–—,:|()\s]+|[-–—,:|()\s]+$/g, '').trim() ||
    rawName.trim().slice(0, 60) ||
    'Project';
  return total > 1 ? `Project ${idx + 1}: ${clean}` : clean;
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
