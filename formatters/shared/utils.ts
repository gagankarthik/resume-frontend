import type { OhioEducationEntry, OhioProjectEntry } from '@/lib/types';

const BULLET_RE = /^[•‣◦⁃∙\-\*\•]\s*/;

export function stripBullet(s: string): string {
  return s.replace(BULLET_RE, '').trim();
}

// Date formatting lives in one place. This module used to carry a second,
// case-sensitive copy, so "JULY 2015" normalised in the Georgia and Oceanblue
// formats but not in Ohio or Pennsylvania, which import from here.
export { normalizeMonthAbbr, normalizeDateSeparator, formatDatePeriod } from '@/lib/docx/shared';

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

/**
 * Splits prose-or-bulleted input into bullets, using ONLY the separators the
 * source itself wrote: newlines, bullet glyphs, and the legacy " | ".
 *
 * There used to be a sentence-splitting pass here that chopped any block over
 * 300 characters into one bullet per sentence. It changed the count: a
 * candidate with one long responsibility got four bullets on the rendered
 * resume, none of which they had written that way. Splitting on punctuation
 * the author did not intend as a list separator is authoring, not formatting.
 * One source item now stays one item.
 */
export function splitProseToBullets(s: string): string[] {
  if (!s) return [];
  return splitBulletItems(s).filter(Boolean);
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
