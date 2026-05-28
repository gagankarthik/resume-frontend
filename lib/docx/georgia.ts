import {
  Document, Packer, Paragraph,
  TextRun, AlignmentType, LevelFormat,
  LineRuleType, BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet,
  normalizeMonthAbbr,
  sortEducation,
  getEdLocation,
  formatLocation,
  splitProseToBullets,
  BODY_SPACING,
  RIGHT_TAB,
} from './shared';

const COLOR = '000000';

const SP       = { before: 0, after: 0,   line: 240, lineRule: LineRuleType.AUTO } as const;
const SP_AFTER = { before: 0, after: 80,  line: 240, lineRule: LineRuleType.AUTO } as const;

function resolveJobLocation(raw: string): string {
  const f = formatLocation(raw ?? '');
  return /^(remote|work from home|wfh|n\/a)$/i.test(f.trim()) ? '' : f;
}

// ── Paragraph helpers ──────────────────────────────────────────────────────

const sectionHdr = (label: string) =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 80, line: 240, lineRule: LineRuleType.AUTO },
    border: {
      bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [
      new TextRun({
        text: label.toUpperCase(),
        bold: true,
        underline: {},
        size: 24,
        font: 'Georgia',
      }),
    ],
  });

const plain = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: SP,
    children: [new TextRun({ text, font: 'Georgia', size: 22 })],
  });

const italic = (text: string) =>
  new Paragraph({
    spacing: SP,
    children: [new TextRun({ text, italics: true, font: 'Georgia', size: 22 })],
  });

const bulletPara = (text: string) =>
  new Paragraph({
    numbering: { reference: 'georgiaBullet', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: BODY_SPACING,
    children: [new TextRun({ text: stripBullet(text), font: 'Georgia', size: 22 })],
  });

const blankLine = () =>
  new Paragraph({
    spacing: { before: 0, after: 60, line: 240, lineRule: LineRuleType.AUTO },
    children: [],
  });

// ── Employment history ─────────────────────────────────────────────────────

function buildEmployment(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  if (!data.employmentHistory?.length) return paras;

  data.employmentHistory.forEach((job, idx) => {
    try {
      const loc    = resolveJobLocation(job.location ?? '');
      const period = normalizeMonthAbbr(job.workPeriod ?? '');

      if (idx > 0) paras.push(blankLine());

      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: job.companyName ?? 'Company', bold: true, size: 24, font: 'Georgia' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: period, size: 22, font: 'Georgia' }),
          ],
        }),
      );

      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP_AFTER,
          children: [
            new TextRun({ text: job.roleName ?? 'Role', italics: true, size: 22, font: 'Georgia' }),
            ...(loc
              ? [new TextRun({ text: '\t' }), new TextRun({ text: loc, size: 22, font: 'Georgia' })]
              : []),
          ],
        }),
      );

      // Responsibilities → bullets (sentence-split per item).
      const liveResps = (job.responsibilities ?? []).filter(r => r && r.trim());
      const points = liveResps.flatMap(splitProseToBullets);
      points.forEach(r => paras.push(bulletPara(r)));

      // Per-job projects (consulting structure)
      (job.projects ?? []).forEach((proj, pi) => {
        const title    = proj.projectName || `Project ${pi + 1}`;
        const subResps = (proj.projectResponsibilities ?? []).filter(r => r.trim());

        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            indent: { left: 360 },
            children: [new TextRun({ text: title, bold: true, size: 22, font: 'Georgia' })],
          }),
        );

        if (subResps.length) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              indent: { left: 360 },
              children: [
                new TextRun({ text: subResps.map(r => stripBullet(r)).join(', '), size: 22, font: 'Georgia' }),
              ],
            }),
          );
        }

        if (proj.keyTechnologies) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              indent: { left: 360 },
              children: [
                new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Georgia' }),
                new TextRun({ text: proj.keyTechnologies, size: 20, font: 'Georgia' }),
              ],
            }),
          );
        }
      });

      // Per-job subsections
      (job.subsections ?? []).forEach(sub => {
        if (sub.title) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              children: [new TextRun({ text: sub.title + ':', bold: true, size: 22, font: 'Georgia' })],
            }),
          );
        }
        const items = (sub.content ?? []).filter(c => c.trim());
        if (items.length) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              children: [
                new TextRun({ text: items.map(r => stripBullet(r)).join(', '), size: 22, font: 'Georgia' }),
              ],
            }),
          );
        }
      });

      if (job.keyTechnologies) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            children: [
              new TextRun({ text: 'Key Technologies/Skills: ', bold: true, size: 20, font: 'Georgia' }),
              new TextRun({ text: job.keyTechnologies, size: 20, font: 'Georgia' }),
            ],
          }),
        );
      }
    } catch {
      paras.push(plain(`[${job.companyName ?? 'Employment entry'} could not be rendered]`));
    }
  });

  return paras;
}

// ── Standalone projects ───────────────────────────────────────────────────

function buildProjects(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  if (!data.projects?.length) return paras;

  data.projects.forEach((proj, idx) => {
    if (idx > 0) paras.push(blankLine());

    paras.push(
      new Paragraph({
        tabStops: [RIGHT_TAB],
        alignment: AlignmentType.JUSTIFIED,
        spacing: SP,
        children: [
          new TextRun({ text: proj.name ?? '', bold: true, size: 24, font: 'Georgia' }),
          ...(proj.date
            ? [new TextRun({ text: '\t' }), new TextRun({ text: proj.date, size: 22, font: 'Georgia' })]
            : []),
        ],
      }),
    );

    if (proj.role) {
      paras.push(
        new Paragraph({
          spacing: SP,
          children: [new TextRun({ text: proj.role, italics: true, size: 22, font: 'Georgia' })],
        }),
      );
    }

    if (proj.description) paras.push(plain(proj.description));

    (proj.highlights ?? [])
      .flatMap(splitProseToBullets)
      .forEach(h => paras.push(bulletPara(h)));

    if ((proj.technologies ?? []).length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Georgia' }),
            new TextRun({ text: proj.technologies!.join(', '), size: 20, font: 'Georgia' }),
          ],
        }),
      );
    }
  });

  return paras;
}

// ── Summary subsections ───────────────────────────────────────────────────

function buildSummarySections(data: ResumeData): Paragraph[] {
  const subs = data.summarySections ?? data.subsections ?? [];
  if (!subs.length) return [];
  const paras: Paragraph[] = [];
  subs.forEach(sub => {
    const items = (sub.content ?? []).filter(c => c.trim());
    if (!sub.title && !items.length) return;
    if (sub.title) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [new TextRun({ text: sub.title, bold: true, size: 22, font: 'Georgia' })],
        }),
      );
    }
    if (items.length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [new TextRun({ text: items.map(r => stripBullet(r)).join(', '), size: 22, font: 'Georgia' })],
        }),
      );
    }
  });
  return paras;
}

// ── Education ──────────────────────────────────────────────────────────────

function buildEducation(data: ResumeData): Paragraph[] {
  const sorted = sortEducation(data.education ?? []);
  return sorted.map(edu => {
    const degreeText = [edu.degree, edu.areaOfStudy ? `in ${edu.areaOfStudy}` : ''].filter(Boolean).join(' ');
    const loc        = getEdLocation(edu.location ?? '');
    const school     = [edu.school, loc].filter(Boolean).join(', ');
    const date       = edu.date ?? '';
    return new Paragraph({
      tabStops: [RIGHT_TAB],
      alignment: AlignmentType.JUSTIFIED,
      spacing: SP_AFTER,
      children: [
        ...(degreeText ? [new TextRun({ text: degreeText, bold: true, size: 22, font: 'Georgia' })] : []),
        ...(school     ? [new TextRun({ text: (degreeText ? ' — ' : '') + school, size: 22, font: 'Georgia' })] : []),
        ...(date       ? [new TextRun({ text: '\t' }), new TextRun({ text: date, size: 22, font: 'Georgia' })] : []),
      ],
    });
  });
}

// ── Technical Skills — Area | Skills table ─────────────────────────────────

type SkillRow = { area: string; skills: string };

function collectSkillRows(data: ResumeData): SkillRow[] {
  const rows: SkillRow[] = [];
  (data.skillCategories ?? []).forEach(c => {
    const list = Array.isArray(c.skills) ? c.skills.filter(s => s?.trim()) : [];
    if (list.length) rows.push({ area: c.categoryName ?? 'Skills', skills: list.join(', ') });
  });
  if (data.technicalSkills) {
    Object.entries(data.technicalSkills).forEach(([k, v]) => {
      const list = Array.isArray(v) ? v.filter(s => s?.trim()).join(', ') : (typeof v === 'string' ? v : '');
      if (list) rows.push({ area: k, skills: list });
    });
  }
  return rows;
}

function buildSkillsParagraphs(data: ResumeData): Paragraph[] {
  const rows = collectSkillRows(data);
  if (!rows.length) return [];
  return rows.map(row =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: SP,
      children: [
        new TextRun({ text: `${row.area}: `, bold: true, size: 22, font: 'Georgia' }),
        new TextRun({ text: row.skills, size: 22, font: 'Georgia' }),
      ],
    }),
  );
}

// ── Certifications ─────────────────────────────────────────────────────────

function buildCertifications(data: ResumeData): Paragraph[] {
  if (!data.certifications?.length) return [];
  return data.certifications.map(cert => {
    const parts: string[] = [];
    if (cert.issuedBy) parts.push(cert.issuedBy);
    if (cert.dateObtained) parts.push(cert.dateObtained);
    const suffix = parts.length ? ` — ${parts.join(' • ')}` : '';
    return new Paragraph({
      numbering: { reference: 'georgiaBullet', level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: BODY_SPACING,
      children: [
        new TextRun({ text: cert.name ?? '', bold: true, size: 22, font: 'Georgia' }),
        ...(suffix ? [new TextRun({ text: suffix, size: 22, font: 'Georgia' })] : []),
      ],
    });
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function buildGeorgiaDocx(data: ResumeData): Promise<void> {
  const children: Paragraph[] = [];

  // Name — centered, bold, underlined, black
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200, line: 240, lineRule: LineRuleType.AUTO },
      children: [
        new TextRun({
          text: (data.name ?? 'Candidate Name').toUpperCase(),
          bold: true,
          underline: {},
          size: 44,
          font: 'Georgia',
        }),
      ],
    }),
  );

  if (data.title) {
    children.push(italic(data.title));
    children.push(blankLine());
  }

  if ((data.employmentHistory?.length ?? 0) > 0) {
    children.push(sectionHdr('Employment History'));
    children.push(...buildEmployment(data));
  }

  const projParas = buildProjects(data);
  if (projParas.length) {
    children.push(sectionHdr('Projects'));
    children.push(...projParas);
  }

  const eduParas = buildEducation(data);
  if (eduParas.length) {
    children.push(sectionHdr('Education'));
    children.push(...eduParas);
  }

  if ((data.professionalSummary?.length ?? 0) > 0) {
    children.push(sectionHdr('Professional Summary'));
    (data.professionalSummary ?? [])
      .flatMap(splitProseToBullets)
      .forEach(pt => children.push(bulletPara(pt)));
    children.push(...buildSummarySections(data));
  }

  const skillsParas = buildSkillsParagraphs(data);
  if (skillsParas.length) {
    children.push(sectionHdr('Technical Skills'));
    children.push(...skillsParas);
  }

  const certParas = buildCertifications(data);
  if (certParas.length) {
    children.push(sectionHdr('Certifications'));
    children.push(...certParas);
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: 'Georgia', hAnsi: 'Georgia', eastAsia: 'Georgia' }, size: 22 },
        },
      },
      paragraphStyles: [{
        id: 'ListParagraph',
        name: 'List Paragraph',
        basedOn: 'Normal',
        quickFormat: true,
        paragraph: { indent: { left: 360, hanging: 360 }, contextualSpacing: true },
      }],
    },
    numbering: {
      config: [{
        reference: 'georgiaBullet',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 360, hanging: 360 } },
            run: { font: 'Georgia', size: 22 },
          },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 720, bottom: 720, left: 720, header: 288, footer: 288, gutter: 0 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.name ?? 'Resume'}_Georgia.docx`);
}
