import type { OhioEducationEntry, OhioProjectEntry } from '@/lib/types';

const BULLET_RE = /^[•‣◦⁃∙\-\*\•]\s*/;

export function stripBullet(s: string): string {
  return s.replace(BULLET_RE, '').trim();
}

const MONTH_MAP: Record<string, string> = {
  January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr',
  May: 'May', June: 'Jun', July: 'Jul', August: 'Aug',
  September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
};

export function normalizeMonthAbbr(s: string): string {
  return s
    .replace(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
      (m) => MONTH_MAP[m] ?? m,
    )
    // Date ranges always use an en dash with spaces, never a bare hyphen.
    .replace(/\s*[-‐‑–—]+\s*/g, ' – ');
}

export function splitBulletItems(s: string): string[] {
  if (!s) return [];

  // 1. Multi-line: each line is its own bullet.
  const lines = s.split(/\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.flatMap(splitInlineBullets).map(stripBullet).filter(Boolean);
  }

  // 2. Single line with inline bullet markers (•, ●, ▪, etc.) — split on them.
  const inline = splitInlineBullets(s);
  if (inline.length > 1) return inline.map(stripBullet).filter(Boolean);

  // 3. " | " separator (legacy backend output).
  const piped = s.split(/\s*\|\s*/);
  if (piped.length > 1) return piped.map(stripBullet).filter(Boolean);

  // NOTE: no semicolon splitting — semicolons are normal punctuation inside a
  // single bullet and splitting on them chops sentences in half.
  return [stripBullet(s)];
}

function splitInlineBullets(s: string): string[] {
  // Split on inline bullet glyphs that appear mid-line, keeping content between them.
  const parts = s.split(/\s*[•●▪‣◦⁃∙]\s+/).map(p => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [s];
}

// Sentence-split helper. Only splits genuinely long prose blocks (a real paragraph);
// bullets of typical length are kept whole so their sentences aren't chopped apart.
// Abbreviations like Sr., Inc., Ph.D., e.g. are re-merged so titles don't get chopped.
const ABBREVS = /\b(?:Mr|Mrs|Ms|Dr|Sr|Jr|Inc|Ltd|Co|Corp|St|vs|etc|e\.g|i\.e|U\.S|U\.K|Ph\.D)\.$/i;

const SENTENCE_SPLIT_MIN = 300;

function sentenceSplit(text: string): string[] {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length < SENTENCE_SPLIT_MIN) return [t];

  const parts: string[] = [];
  let buf = '';
  const tokens = t.split(/(?<=[.!?])\s+(?=[A-Z(0-9])/);
  for (const tok of tokens) {
    if (ABBREVS.test(buf)) {
      buf = `${buf} ${tok}`;
      continue;
    }
    if (buf) parts.push(buf.trim());
    buf = tok;
  }
  if (buf) parts.push(buf.trim());

  const cleaned = parts.filter(Boolean);
  return cleaned.length > 1 ? cleaned : [t];
}

// Splits prose-or-bulleted input into bullets. First applies the structured splitters
// (newlines / glyphs / | / ;) via splitBulletItems, then sentence-splits each resulting
// chunk so multi-sentence pre-bullet text doesn't render as one mega-bullet.
export function splitProseToBullets(s: string): string[] {
  if (!s) return [];
  const items = splitBulletItems(s);
  return items.flatMap(sentenceSplit).filter(Boolean);
}

export function sortEducation(education: OhioEducationEntry[]): OhioEducationEntry[] {
  return [...education].sort((a, b) => {
    const da = parseYear(a.date);
    const db = parseYear(b.date);
    return db - da; // most recent first
  });
}

function parseYear(s?: string): number {
  if (!s) return 0;
  const m = s.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}

export function formatEmploymentLocation(location: string): string {
  if (!location) return '';
  // Trim and normalise separators
  return location.trim().replace(/\s*,\s*/g, ', ');
}

export function getEducationCountry(location?: string): string {
  if (!location) return '';
  const parts = location.split(',').map(p => p.trim());
  // Return last part (usually country) or full location if short
  return parts.length > 1 ? parts[parts.length - 1] : location;
}

export function formatProjectParts(
  proj: OhioProjectEntry & { projectLocation?: string },
  index: number,
  total: number,
): { prefix: string; name: string } {
  const isOnly = total === 1;
  const prefix = isOnly ? 'Project' : `Project ${index + 1}`;
  const clientPart = proj.clientName ? ` — ${proj.clientName}` : '';
  const locationPart = proj.projectLocation ? ` (${proj.projectLocation})` : '';
  const name = `${proj.projectName ?? 'Unnamed Project'}${clientPart}${locationPart}`;
  return { prefix, name };
}
