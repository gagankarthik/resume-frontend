import { Paragraph, TextRun, AlignmentType, LineRuleType } from 'docx';
import type { ResumeData } from '@/lib/types';
import { stripBullet, BODY_SPACING, RIGHT_TAB } from './shared';

/**
 * Shared DOCX builder for the supplemental resume sections:
 * Patents, Conferences & Talks, Courses, Training, References.
 *
 * Awards, publications, languages, volunteer experience, memberships and
 * interests are not built — the engine no longer extracts them.
 *
 * Every format renders the SAME data through this builder (parameterized by
 * font / bullet-numbering reference / section-header factory) so no format
 * silently drops information the backend extracted.
 */
export interface SupplementalStyle {
  font: string;
  bulletRef: string;
  sectionHdr: (label: string) => Paragraph;
}

/** Standalone "Projects" section (outside work experience) — shared by the
 *  formats that don't define their own renderer for it. */
export function buildProjectsDocx(data: ResumeData, style: SupplementalStyle): Paragraph[] {
  const { font, bulletRef } = style;
  const SP = { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } as const;
  const paras: Paragraph[] = [];
  if (!data.projects?.length) return paras;

  data.projects.forEach((proj, idx) => {
    if (idx > 0) {
      paras.push(new Paragraph({ spacing: { before: 0, after: 60, line: 240, lineRule: LineRuleType.AUTO }, children: [] }));
    }
    paras.push(
      new Paragraph({
        tabStops: [RIGHT_TAB],
        alignment: AlignmentType.JUSTIFIED,
        spacing: SP,
        children: [
          new TextRun({ text: proj.name ?? '', bold: true, size: 24, font }),
          ...(proj.date
            ? [new TextRun({ text: '\t' }), new TextRun({ text: proj.date, size: 22, font })]
            : []),
        ],
      }),
    );
    if (proj.role) {
      paras.push(
        new Paragraph({
          spacing: SP,
          children: [new TextRun({ text: proj.role, italics: true, size: 22, font })],
        }),
      );
    }
    if (proj.description) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [new TextRun({ text: proj.description, size: 22, font })],
        }),
      );
    }
    (proj.highlights ?? []).filter(h => h?.trim()).forEach(h =>
      paras.push(
        new Paragraph({
          numbering: { reference: bulletRef, level: 0 },
          alignment: AlignmentType.JUSTIFIED,
          spacing: BODY_SPACING,
          children: [new TextRun({ text: stripBullet(h), size: 22, font })],
        }),
      ),
    );
    if ((proj.technologies ?? []).length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 20, font }),
            new TextRun({ text: proj.technologies!.join(', '), size: 20, font }),
          ],
        }),
      );
    }
  });

  return paras;
}

export function buildSupplementalDocx(data: ResumeData, style: SupplementalStyle): Paragraph[] {
  const { font, bulletRef, sectionHdr } = style;

  const labeledBullet = (boldText: string, rest = '') =>
    new Paragraph({
      numbering: { reference: bulletRef, level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: BODY_SPACING,
      children: [
        new TextRun({ text: boldText, bold: true, size: 22, font }),
        ...(rest ? [new TextRun({ text: rest, size: 22, font })] : []),
      ],
    });

  const out: Paragraph[] = [];
  const section = (label: string, paras: Paragraph[]) => {
    if (paras.length) {
      out.push(sectionHdr(label));
      out.push(...paras);
    }
  };
  const suffix = (...parts: (string | false | undefined | null)[]) =>
    parts.filter(Boolean).join('');

  section('Patents', (data.patents ?? []).map(p =>
    labeledBullet(p.title ?? '', suffix(
      p.patentNumber && ` — ${p.patentNumber}`,
      p.date && ` (${p.date})`,
    )),
  ));

  section('Conferences & Talks', (data.conferences ?? []).map(c =>
    labeledBullet(c.title ?? '', suffix(
      c.event && ` — ${c.event}`,
      c.date && ` (${c.date})`,
    )),
  ));

  section('Courses', (data.courses ?? []).map(c =>
    labeledBullet(c.name ?? '', suffix(
      c.provider && ` — ${c.provider}`,
      c.date && ` (${c.date})`,
    )),
  ));

  section('Training', (data.training ?? []).map(t =>
    labeledBullet(t.name ?? '', suffix(
      t.provider && ` — ${t.provider}`,
      t.date && ` (${t.date})`,
    )),
  ));

  section('References', (data.references ?? []).map(r =>
    labeledBullet(r.name ?? '', suffix(
      r.title && ` — ${r.title}`,
      r.company && `, ${r.company}`,
      r.email && ` · ${r.email}`,
      r.phone && ` · ${r.phone}`,
    )),
  ));

  return out;
}
