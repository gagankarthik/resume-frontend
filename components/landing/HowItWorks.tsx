'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  GlyphCheck,
  GlyphExport,
  GlyphExtract,
  GlyphRead,
  GlyphReview,
} from './illustrations/StepGlyphs';

export const STEPS = [
  {
    title: 'Read the file',
    Glyph: GlyphRead,
    body: 'Two-column PDFs, skill matrices, tables and repeated headers are read in the order a person would read them.',
    more: [
      'PDF, Word (.docx, .doc) and plain text up to 20 MB',
      'Scanned pages read with OCR',
      'Two-column layouts, skill matrices and tables captured in reading order',
    ],
  },
  {
    title: 'Extract the sections',
    Glyph: GlyphExtract,
    body: 'More than twenty sections are separated into fields. Bullets are copied character for character.',
    more: [
      'Contact, summary, skills, work history, projects, education, certifications and more',
      'Nothing shortened, merged or reworded',
      'Skill groups kept in the candidate’s own categories',
    ],
  },
  {
    title: 'Check against the source',
    Glyph: GlyphCheck,
    body: 'Every meaningful line of the original is matched back to the record. Gaps are flagged, not hidden.',
    more: [
      'Bullet counts compared role by role',
      'Dates, email and phone confirmed as present in the source',
      'Anything missing listed at the top of the editor',
    ],
  },
  {
    title: 'Review and fix',
    Glyph: GlyphReview,
    body: 'A full editor sits between extraction and download. Nothing is written until you say so.',
    more: [
      'Every section editable, with flagged items first',
      'Add the role title and requisition number the agency asks for',
      'Preview the document before exporting',
    ],
  },
  {
    title: 'Export the document',
    Glyph: GlyphExport,
    body: 'The reviewed record is set into the template you pick, and can be exported again for another agency.',
    more: [
      'Word (.docx) output for Ohio, Pennsylvania, Georgia and Oceanblue',
      'Section order, tables and type follow the template',
      'One record, as many exports as you need',
    ],
  },
];

/** The five passes in a row, joined by a line that draws once. */
export function StepsRow() {
  const still = useReducedMotion();
  return (
    <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
      <motion.span
        aria-hidden
        className="absolute left-[10%] right-[10%] top-9 hidden h-px origin-left bg-tc-line-2 lg:block"
        initial={still ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative">
          <span className="relative z-10 grid h-[72px] w-[72px] place-items-center rounded-full border border-tc-line bg-white shadow-[0_8px_20px_-14px_rgba(12,27,51,0.4)]">
            <s.Glyph size={40} />
            <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-tc-ink text-[12px] font-semibold text-white">
              {i + 1}
            </span>
          </span>
          <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-tc-ink">{s.title}</h3>
          <p className="mt-2 text-[14.5px] leading-[1.6] text-tc-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** The long form for /how-it-works: each pass with what it does in detail. */
export function StepsDetailed() {
  return (
    <ol className="relative">
      <span className="absolute bottom-10 left-[35px] top-10 hidden w-px bg-tc-line sm:block" aria-hidden />
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative grid gap-6 py-10 first:pt-0 last:pb-0 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-10">
          <span className="relative z-10 grid h-[72px] w-[72px] place-items-center rounded-full border border-tc-line bg-white">
            <s.Glyph size={40} />
          </span>
          <div className="grid gap-6 border-b border-tc-line pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="text-[14px] font-semibold text-tc-azure">Pass {i + 1} of {STEPS.length}</p>
              <h2 className="mt-2 text-[26px] font-bold tracking-[-0.025em] text-tc-ink sm:text-[30px]">{s.title}</h2>
              <p className="mt-3 text-[16px] leading-[1.65] text-tc-muted">{s.body}</p>
            </div>
            <ul className="space-y-3 lg:pt-9">
              {s.more.map(m => (
                <li key={m} className="flex gap-3 text-[15px] leading-[1.55] text-tc-ink-2">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-tc-cyan" aria-hidden />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
