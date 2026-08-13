import { Paragraph, TextRun, AlignmentType, LineRuleType } from 'docx';
import type { ResumeData } from '@/lib/types';
import { stripBullet, text, textList, objList, BODY_SPACING, RIGHT_TAB } from './shared';
import type { SimpleProject, PatentEntry, ConferenceEntry, CourseEntry, TrainingEntry, ReferenceEntry } from '@/lib/types';

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
  const projects = objList<SimpleProject>(data.projects);
  if (!projects.length) return paras;

  projects.forEach((proj, idx) => {
    if (idx > 0) {
      paras.push(new Paragraph({ spacing: { before: 0, after: 60, line: 240, lineRule: LineRuleType.AUTO }, children: [] }));
    }
    paras.push(
      new Paragraph({
        tabStops: [RIGHT_TAB],
        alignment: AlignmentType.JUSTIFIED,
        spacing: SP,
        children: [
          new TextRun({ text: text(proj.name), bold: true, size: 24, font }),
          ...(text(proj.date).trim()
            ? [new TextRun({ text: '\t' }), new TextRun({ text: text(proj.date), size: 22, font })]
            : []),
        ],
      }),
    );
    if (text(proj.role).trim()) {
      paras.push(
        new Paragraph({
          spacing: SP,
          children: [new TextRun({ text: text(proj.role), italics: true, size: 22, font })],
        }),
      );
    }
    if (text(proj.description).trim()) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [new TextRun({ text: text(proj.description), size: 22, font })],
        }),
      );
    }
    textList(proj.highlights).forEach(h =>
      paras.push(
        new Paragraph({
          numbering: { reference: bulletRef, level: 0 },
          alignment: AlignmentType.JUSTIFIED,
          spacing: BODY_SPACING,
          children: [new TextRun({ text: stripBullet(h), size: 22, font })],
        }),
      ),
    );
    const tech = textList(proj.technologies);
    if (tech.length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 20, font }),
            new TextRun({ text: tech.join(', '), size: 20, font }),
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
  /** A trailing detail, included only when it has one. */
  const part = (v: unknown, wrap: (s: string) => string) => {
    const s = text(v).trim();
    return s ? wrap(s) : '';
  };
  const suffix = (...parts: string[]) => parts.join('');

  section('Patents', objList<PatentEntry>(data.patents).map(p =>
    labeledBullet(text(p.title), suffix(
      part(p.patentNumber, s => ` — ${s}`),
      part(p.date, s => ` (${s})`),
    )),
  ));

  section('Conferences & Talks', objList<ConferenceEntry>(data.conferences).map(c =>
    labeledBullet(text(c.title), suffix(
      part(c.event, s => ` — ${s}`),
      part(c.date, s => ` (${s})`),
    )),
  ));

  section('Courses', objList<CourseEntry>(data.courses).map(c =>
    labeledBullet(text(c.name), suffix(
      part(c.provider, s => ` — ${s}`),
      part(c.date, s => ` (${s})`),
    )),
  ));

  section('Training', objList<TrainingEntry>(data.training).map(t =>
    labeledBullet(text(t.name), suffix(
      part(t.provider, s => ` — ${s}`),
      part(t.date, s => ` (${s})`),
    )),
  ));

  section('References', objList<ReferenceEntry>(data.references).map(r =>
    labeledBullet(text(r.name), suffix(
      part(r.title, s => ` — ${s}`),
      part(r.company, s => `, ${s}`),
      part(r.email, s => ` · ${s}`),
      part(r.phone, s => ` · ${s}`),
    )),
  ));

  return out;
}
