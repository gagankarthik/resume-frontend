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
  return s.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
    (m) => MONTH_MAP[m] ?? m,
  );
}

export function splitBulletItems(s: string): string[] {
  if (!s) return [];
  // Split on newlines containing bullets, or semicolons if no newlines
  const lines = s.split(/\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.map(stripBullet).filter(Boolean);
  }
  // Try semicolons
  const semi = s.split(/;\s*/);
  if (semi.length > 1) return semi.map(stripBullet).filter(Boolean);
  return [stripBullet(s)];
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
