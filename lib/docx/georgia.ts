import {
  Document, Packer, Paragraph,
  TextRun, AlignmentType, LevelFormat,
  LineRuleType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet,
  formatDatePeriod,
  sortEducation,
  getEdLocation,
  formatLocation,
  splitProseToBullets,
  projectTitleWithClient,
  BODY_SPACING,
  RIGHT_TAB,
} from './shared';
import { buildSupplementalDocx } from './supplemental';

const SP      = { before: 0, after: 0,   line: 240, lineRule: LineRuleType.AUTO } as const;
const SP_AFTER = { before: 0, after: 80,  line: 240, lineRule: LineRuleType.AUTO } as const;

function resolveJobLocation(raw: string): string {
  const f = formatLocation(raw ?? '');
  return /^(remote|work from home|wfh|n\/a)$/i.test(f.trim()) ? '' : f;
}

function shortenLinkedIn(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `linkedin.com${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}

function shortenGitHub(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `github.com${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}

// ── Paragraph helpers ──────────────────────────────────────────────────────

const sectionHdr = (label: string) =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 80, line: 240, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text: label.toUpperCase(),
        bold: true,
        size: 24,
        font: 'Verdana',
      }),
    ],
  });

const plain = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: SP,
    children: [new TextRun({ text, font: 'Verdana', size: 22 })],
  });


const bulletPara = (text: string) =>
  new Paragraph({
    numbering: { reference: 'georgiaBullet', level: 0 },
    alignment: AlignmentType.LEFT,
    spacing: BODY_SPACING,
    children: [new TextRun({ text: stripBullet(text), font: 'Verdana', size: 22 })],
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
      // Use a small hyphen for the date range, not the en dash formatDatePeriod emits.
      const period = formatDatePeriod(job.workPeriod ?? '').replace(/\s*–\s*/g, ' - ');

      if (idx > 0) paras.push(blankLine());

      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.LEFT,
          spacing: SP,
          children: [
            new TextRun({ text: job.companyName ?? 'Company', bold: true, size: 24, font: 'Verdana' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: period, size: 22, font: 'Verdana' }),
          ],
        }),
      );

      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.LEFT,
          spacing: SP_AFTER,
          children: [
            new TextRun({ text: job.roleName ?? 'Role', size: 22, font: 'Verdana' }),
            ...(loc
              ? [new TextRun({ text: '\t' }), new TextRun({ text: loc, size: 22, font: 'Verdana' })]
              : []),
          ],
        }),
      );

      const dept = (job.department ?? '').trim();
      if (dept) paras.push(plain(dept));

      // Responsibilities → "Responsibilities" heading + bullets below it.
      const liveResps = (job.responsibilities ?? []).filter(r => r && r.trim());
      const points = liveResps.flatMap(splitProseToBullets);
      if (points.length) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { ...SP, before: 60 },
            children: [new TextRun({ text: 'Responsibilities', bold: true, size: 22, font: 'Verdana' })],
          }),
        );
      }
      points.forEach(r => paras.push(bulletPara(r)));

      // Per-job projects (consulting structure)
      (job.projects ?? []).forEach((proj, pi) => {
        const title    = projectTitleWithClient(proj, `Project ${pi + 1}`);
        const subResps = (proj.projectResponsibilities ?? []).filter(r => r.trim());

        paras.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: SP,
            indent: { left: 360 },
            children: [new TextRun({ text: title, bold: true, size: 22, font: 'Verdana' })],
          }),
        );

        if (subResps.length) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: SP,
              indent: { left: 360 },
              children: [
                new TextRun({ text: subResps.map(r => stripBullet(r)).join(', '), size: 22, font: 'Verdana' }),
              ],
            }),
          );
        }

        if (proj.keyTechnologies) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: SP,
              indent: { left: 360 },
              children: [
                new TextRun({ text: 'Technologies: ', bold: true, size: 22, font: 'Verdana' }),
                new TextRun({ text: proj.keyTechnologies, size: 22, font: 'Verdana' }),
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
              alignment: AlignmentType.LEFT,
              spacing: SP,
              children: [new TextRun({ text: sub.title + ':', bold: true, size: 22, font: 'Verdana' })],
            }),
          );
        }
        const items = (sub.content ?? []).filter(c => c.trim());
        if (items.length) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: SP,
              children: [
                new TextRun({ text: items.map(r => stripBullet(r)).join(', '), size: 22, font: 'Verdana' }),
              ],
            }),
          );
        }
      });

      if (job.keyTechnologies) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { ...SP, before: 120 },
            children: [
              new TextRun({ text: 'Key Technologies/Skills: ', bold: true, size: 22, font: 'Verdana' }),
              new TextRun({ text: job.keyTechnologies, size: 22, font: 'Verdana' }),
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
        alignment: AlignmentType.LEFT,
        spacing: SP,
        children: [
          new TextRun({ text: proj.name ?? '', bold: true, size: 24, font: 'Verdana' }),
          ...(proj.date
            ? [new TextRun({ text: '\t' }), new TextRun({ text: proj.date, size: 22, font: 'Verdana' })]
            : []),
        ],
      }),
    );

    if (proj.role) {
      paras.push(
        new Paragraph({
          spacing: SP,
          children: [new TextRun({ text: proj.role, size: 22, font: 'Verdana' })],
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
          alignment: AlignmentType.LEFT,
          spacing: SP,
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 22, font: 'Verdana' }),
            new TextRun({ text: proj.technologies!.join(', '), size: 22, font: 'Verdana' }),
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
          alignment: AlignmentType.LEFT,
          spacing: SP,
          children: [new TextRun({ text: sub.title, bold: true, size: 22, font: 'Verdana' })],
        }),
      );
    }
    if (items.length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: SP,
          children: [new TextRun({ text: items.map(r => stripBullet(r)).join(', '), size: 22, font: 'Verdana' })],
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
      alignment: AlignmentType.LEFT,
      spacing: SP_AFTER,
      children: [
        ...(degreeText ? [new TextRun({ text: degreeText, bold: true, size: 22, font: 'Verdana' })] : []),
        ...(school     ? [new TextRun({ text: (degreeText ? ' — ' : '') + school, size: 22, font: 'Verdana' })] : []),
        ...(date       ? [new TextRun({ text: '\t' }), new TextRun({ text: date, size: 22, font: 'Verdana' })] : []),
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
      alignment: AlignmentType.LEFT,
      spacing: SP,
      children: [
        new TextRun({ text: `${row.area}: `, bold: true, size: 22, font: 'Verdana' }),
        new TextRun({ text: row.skills, size: 22, font: 'Verdana' }),
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
      alignment: AlignmentType.LEFT,
      spacing: BODY_SPACING,
      children: [
        new TextRun({ text: cert.name ?? '', bold: true, size: 22, font: 'Verdana' }),
        ...(suffix ? [new TextRun({ text: suffix, size: 22, font: 'Verdana' })] : []),
      ],
    });
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function buildGeorgiaDocx(data: ResumeData): Promise<void> {
  const children: Paragraph[] = [];

  // Name — centered, bold, black (no underline)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200, line: 240, lineRule: LineRuleType.AUTO },
      children: [
        new TextRun({
          text: (data.name ?? 'Candidate Name').toUpperCase(),
          bold: true,
          size: 40,
          font: 'Verdana',
        }),
      ],
    }),
  );

  // Contact line — email | phone | linkedin | location (was missing from the DOCX)
  const contactParts: string[] = [];
  if (data.email)    contactParts.push(data.email);
  if (data.phone)    contactParts.push(data.phone);
  if (data.linkedin) contactParts.push(shortenLinkedIn(data.linkedin));
  if (data.github)   contactParts.push(shortenGitHub(data.github));
  if (data.location) contactParts.push(data.location);
  if (contactParts.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160, line: 240, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Verdana' })],
      }),
    );
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

  // Awards, publications, languages, volunteer, patents, memberships,
  // conferences, courses, training, interests, references — same order as
  // the preview, via the builder shared by all formats.
  children.push(...buildSupplementalDocx(data, { font: 'Verdana', bulletRef: 'georgiaBullet', sectionHdr }));

  // Education is the closing section — nothing is rendered after it.
  const eduParas = buildEducation(data);
  if (eduParas.length) {
    children.push(sectionHdr('Education'));
    children.push(...eduParas);
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: 'Verdana', hAnsi: 'Verdana', eastAsia: 'Verdana' }, size: 22 },
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
            run: { font: 'Verdana', size: 22 },
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
