import {
  Document, Paragraph,
  TextRun, AlignmentType, LevelFormat,
  LineRuleType,
} from 'docx';
import type {
  ResumeData, OhioEducationEntry, OhioCertificationEntry,
  OhioEmploymentEntry, OhioProjectEntry, OhioSubsection, SimpleProject,
} from '@/lib/types';
import {
  stripBullet,
  formatDatePeriod,
  sortEducation,
  getEdLocation,
  responsibilityBullets,
  splitProseToBullets,
  projectTitleWithClient,
  resolveJobLocation,
  contactLine,
  text,
  textList,
  objList,
  safely,
  BODY_SPACING,
  RIGHT_TAB,
} from './shared';
import { buildSupplementalDocx } from './supplemental';
import { downloadDocx } from './download';

const SP      = { before: 0, after: 0,   line: 240, lineRule: LineRuleType.AUTO } as const;
const SP_AFTER = { before: 0, after: 80,  line: 240, lineRule: LineRuleType.AUTO } as const;




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

const plain = (t: unknown) =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: SP,
    children: [new TextRun({ text: text(t), font: 'Verdana', size: 22 })],
  });


const bulletPara = (t: unknown, level: 0 | 1 = 0, indent?: number) =>
  new Paragraph({
    numbering: { reference: 'georgiaBullet', level },
    alignment: AlignmentType.LEFT,
    spacing: BODY_SPACING,
    ...(indent ? { indent: { left: indent } } : {}),
    children: [new TextRun({ text: stripBullet(t), font: 'Verdana', size: 22 })],
  });

/** One bullet per source line, keeping any sub-bullet nesting. */
const respBullets = (items: unknown, indent?: number) =>
  responsibilityBullets(items).map(r => bulletPara(r.text, r.level, indent));

const blankLine = () =>
  new Paragraph({
    spacing: { before: 0, after: 60, line: 240, lineRule: LineRuleType.AUTO },
    children: [],
  });

// ── Employment history ─────────────────────────────────────────────────────

function buildEmployment(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  const jobs = objList<OhioEmploymentEntry>(data.employmentHistory);
  if (!jobs.length) return paras;

  jobs.forEach((job, idx) => {
    try {
      const loc    = resolveJobLocation(job.location);
      // Use a small hyphen for the date range, not the en dash formatDatePeriod emits.
      const period = formatDatePeriod(job.workPeriod).replace(/\s*–\s*/g, ' - ');

      if (idx > 0) paras.push(blankLine());

      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.LEFT,
          spacing: SP,
          children: [
            new TextRun({ text: text(job.companyName) || 'Company', bold: true, size: 24, font: 'Verdana' }),
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
            new TextRun({ text: text(job.roleName) || 'Role', size: 22, font: 'Verdana' }),
            ...(loc
              ? [new TextRun({ text: '\t' }), new TextRun({ text: loc, size: 22, font: 'Verdana' })]
              : []),
          ],
        }),
      );

      const dept = text(job.department).trim();
      if (dept) paras.push(plain(dept));

      // Responsibilities → "Responsibilities" heading + bullets below it.
      const points = respBullets(job.responsibilities);
      if (points.length) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { ...SP, before: 60 },
            children: [new TextRun({ text: 'Responsibilities', bold: true, size: 22, font: 'Verdana' })],
          }),
        );
        paras.push(...points);
      }

      // Per-job projects (consulting structure)
      objList<OhioProjectEntry>(job.projects).forEach((proj, pi) => {
        const title = projectTitleWithClient(proj, `Project ${pi + 1}`, job.companyName);

        paras.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: SP,
            indent: { left: 360 },
            children: [new TextRun({ text: title, bold: true, size: 22, font: 'Verdana' })],
          }),
        );

        // One bullet per responsibility. These were comma-joined into a
        // single paragraph, which is not what the resume said.
        paras.push(...respBullets(proj.projectResponsibilities, 720));

        if (text(proj.keyTechnologies).trim()) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: SP,
              indent: { left: 360 },
              children: [
                new TextRun({ text: 'Technologies: ', bold: true, size: 22, font: 'Verdana' }),
                new TextRun({ text: text(proj.keyTechnologies), size: 22, font: 'Verdana' }),
              ],
            }),
          );
        }
      });

      // Per-job subsections
      objList<OhioSubsection>(job.subsections).forEach(sub => {
        const title = text(sub.title).trim();
        if (title) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: SP,
              children: [new TextRun({ text: title + ':', bold: true, size: 22, font: 'Verdana' })],
            }),
          );
        }
        paras.push(...respBullets(sub.content));
      });

      if (text(job.keyTechnologies).trim()) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { ...SP, before: 120 },
            children: [
              new TextRun({ text: 'Key Technologies/Skills: ', bold: true, size: 22, font: 'Verdana' }),
              new TextRun({ text: text(job.keyTechnologies), size: 22, font: 'Verdana' }),
            ],
          }),
        );
      }
    } catch (e) {
       
      console.error('employment entry could not be rendered', e);
      paras.push(plain(`[${text(job.companyName) || 'Employment entry'} could not be rendered]`));
    }
  });

  return paras;
}

// ── Standalone projects ───────────────────────────────────────────────────

function buildProjects(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  const projects = objList<SimpleProject>(data.projects);
  if (!projects.length) return paras;

  projects.forEach((proj, idx) => {
    if (idx > 0) paras.push(blankLine());

    paras.push(
      new Paragraph({
        tabStops: [RIGHT_TAB],
        alignment: AlignmentType.LEFT,
        spacing: SP,
        children: [
          new TextRun({ text: text(proj.name), bold: true, size: 24, font: 'Verdana' }),
          ...(text(proj.date).trim()
            ? [new TextRun({ text: '\t' }), new TextRun({ text: text(proj.date), size: 22, font: 'Verdana' })]
            : []),
        ],
      }),
    );

    if (text(proj.role).trim()) {
      paras.push(
        new Paragraph({
          spacing: SP,
          children: [new TextRun({ text: text(proj.role), size: 22, font: 'Verdana' })],
        }),
      );
    }

    if (text(proj.description).trim()) paras.push(plain(proj.description));

    textList(proj.highlights)
      .flatMap(splitProseToBullets)
      .forEach(h => paras.push(bulletPara(h)));

    const tech = textList(proj.technologies);
    if (tech.length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: SP,
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 22, font: 'Verdana' }),
            new TextRun({ text: tech.join(', '), size: 22, font: 'Verdana' }),
          ],
        }),
      );
    }
  });

  return paras;
}

// ── Summary subsections ───────────────────────────────────────────────────

function buildSummarySections(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  objList<OhioSubsection>(data.summarySections ?? data.subsections).forEach(sub => {
    const title = text(sub.title).trim();
    const items = textList(sub.content);
    if (!title && !items.length) return;
    if (title) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: SP,
          children: [new TextRun({ text: title, bold: true, size: 22, font: 'Verdana' })],
        }),
      );
    }
    items.forEach(item => paras.push(bulletPara(item)));
  });
  return paras;
}

// ── Education ──────────────────────────────────────────────────────────────

function buildEducation(data: ResumeData): Paragraph[] {
  const sorted = sortEducation<OhioEducationEntry>(data.education);
  return sorted.map(edu => {
    const area       = text(edu.areaOfStudy).trim();
    const degreeText = [text(edu.degree).trim(), area ? `in ${area}` : ''].filter(Boolean).join(' ');
    const loc        = getEdLocation(edu.location);
    const school     = [text(edu.school).trim(), loc].filter(Boolean).join(', ');
    const date       = text(edu.date).trim();
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
  objList<{ categoryName?: string; skills?: unknown }>(data.skillCategories).forEach(c => {
    const list = textList(c.skills);
    if (list.length) rows.push({ area: text(c.categoryName) || 'Skills', skills: list.join(', ') });
  });
  const technical = data.technicalSkills;
  if (technical && typeof technical === 'object') {
    Object.entries(technical).forEach(([k, v]) => {
      const list = textList(v).join(', ');
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
  return objList<OhioCertificationEntry>(data.certifications).map(cert => {
    const parts = [text(cert.issuedBy).trim(), text(cert.dateObtained).trim()].filter(Boolean);
    const suffix = parts.length ? ` — ${parts.join(' • ')}` : '';
    return new Paragraph({
      numbering: { reference: 'georgiaBullet', level: 0 },
      alignment: AlignmentType.LEFT,
      spacing: BODY_SPACING,
      children: [
        new TextRun({ text: text(cert.name), bold: true, size: 22, font: 'Verdana' }),
        ...(suffix ? [new TextRun({ text: suffix, size: 22, font: 'Verdana' })] : []),
      ],
    });
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Assemble the document, without writing it anywhere. See submissionForm.ts
 * for why this is separate from the download helper.
 */
export function buildGeorgiaDocument(data: ResumeData): Document {
  const children: Paragraph[] = [];

  // Name — centered, bold, black (no underline)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200, line: 240, lineRule: LineRuleType.AUTO },
      children: [
        new TextRun({
          text: (text(data.name) || 'Candidate Name').toUpperCase(),
          bold: true,
          size: 40,
          font: 'Verdana',
        }),
      ],
    }),
  );

  // Title / Role — centered under the name.
  //
  // This line was removed when the title was inferred from the most recent
  // job, because printing a title the resume never claimed is a fabrication.
  // The field is now entered by the recruiter and says which role the
  // candidate is being submitted for, so dropping it loses something the
  // recruiter typed. Every other template prints it; Georgia was the one that
  // still silently discarded it.
  if (text(data.title).trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80, line: 240, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: text(data.title), bold: true, size: 22, font: 'Verdana' })],
      }),
    );
  }

  // Contact line — email | phone | linkedin | location (was missing from the DOCX)
  const contactParts = contactLine(data);
  if (contactParts.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160, line: 240, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: contactParts.join('  |  '), size: 18, font: 'Verdana' })],
      }),
    );
  }

  // Each section renders on its own, so one bad entry cannot take the file
  // down with it.
  const section = (label: string, build: () => Paragraph[]) => {
    const paras = safely(build, () => []);
    if (paras.length) {
      children.push(sectionHdr(label));
      children.push(...paras);
    }
  };

  section('Employment History', () => buildEmployment(data));
  section('Projects', () => buildProjects(data));

  section('Professional Summary', () => [
    ...textList(data.professionalSummary).flatMap(splitProseToBullets).map(pt => bulletPara(pt)),
    ...buildSummarySections(data),
  ]);

  section('Technical Skills', () => buildSkillsParagraphs(data));
  section('Certifications', () => buildCertifications(data));

  // Patents, conferences, courses, training, references — same order as the
  // preview, via the builder shared by all formats.
  children.push(...safely(
    () => buildSupplementalDocx(data, { font: 'Verdana', bulletRef: 'georgiaBullet', sectionHdr }),
    () => [],
  ));

  // Education is the closing section — nothing is rendered after it.
  section('Education', () => buildEducation(data));

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
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 360, hanging: 360 } },
              run: { font: 'Verdana', size: 22 },
            },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: '○',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
              run: { font: 'Verdana', size: 22 },
            },
          },
        ],
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

  return doc;
}

/** Build the document and hand it to the browser as a download. */
export async function buildGeorgiaDocx(data: ResumeData): Promise<void> {
  await downloadDocx(buildGeorgiaDocument(data), data, 'Georgia');
}
