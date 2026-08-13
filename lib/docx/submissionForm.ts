/**
 * The VMS submission form — Ohio and Pennsylvania.
 *
 * The two templates are the same document: the same tables, the same column
 * widths, the same section order, the same accent. They differ in one string,
 * the name of the system the requisition number comes from. They used to be
 * two 500-line files that were byte-identical apart from that string, so every
 * fix had to be made twice — and the bug that fused a project's bullets into
 * one paragraph shipped in both. One builder now, with one parameter.
 */
import {
  Document, Paragraph, Table, TableCell, TableRow,
  TextRun, AlignmentType, WidthType, ShadingType,
  VerticalAlign, LevelFormat, LineRuleType, HeightRule,
} from 'docx';
import type { ResumeData, OhioEducationEntry, OhioCertificationEntry, OhioEmploymentEntry, OhioProjectEntry, OhioSubsection } from '@/lib/types';
import {
  stripBullet, formatDatePeriod, splitProseToBullets, sortEducation,
  getEdLocation, formatProjectTitle, awardedLabel,
  responsibilityBullets, projectHeading, resolveJobLocation,
  text, textList, objList, safely,
  BODY_SPACING, RIGHT_TAB, TABLE_BORDER,
} from './shared';
import { buildSupplementalDocx, buildProjectsDocx } from './supplemental';

// ── Education table ────────────────────────────────────────────────────────

function buildEducationTable(data: ResumeData): Table {
  const eduHdrCell = (w: number, runs: TextRun[]) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
          children: runs,
        }),
      ],
    });

  const eduDataCell = (v: unknown) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
          children: [new TextRun({ text: text(v).trim() || '-', font: 'Calibri', size: 22 })],
        }),
      ],
    });

  const sorted = sortEducation<OhioEducationEntry>(data.education);
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        eduHdrCell(1653, [new TextRun({ text: 'Degree ', bold: true, font: 'Arial', size: 20 }), new TextRun({ text: '(AA/AS, BA/BS, BS/BTech/BE, MS/MTech/MBA/MA, PhD/Doctoral)', font: 'Arial', size: 20 })]),
        eduHdrCell(1901, [new TextRun({ text: 'Area of Study', bold: true, font: 'Arial', size: 20 })]),
        eduHdrCell(2684, [new TextRun({ text: 'School/College/University', bold: true, font: 'Arial', size: 20 })]),
        eduHdrCell(1712, [new TextRun({ text: 'Location', bold: true, font: 'Arial', size: 20 })]),
        eduHdrCell(1524, [new TextRun({ text: 'Was the degree awarded?', bold: true, font: 'Arial', size: 20 }), new TextRun({ text: ' (Yes/No)', font: 'Arial', size: 20 })]),
        eduHdrCell(1316, [new TextRun({ text: 'OPTIONAL: Date', bold: true, font: 'Arial', size: 20 }), new TextRun({ text: ' (MM/YY)', font: 'Arial', size: 20 })]),
      ],
    }),
    ...(sorted.length > 0
      ? sorted.map(edu =>
          new TableRow({
            height: { value: 58, rule: HeightRule.ATLEAST },
            cantSplit: true,
            children: [
              eduDataCell(edu.degree),
              eduDataCell(edu.areaOfStudy),
              eduDataCell(edu.school),
              eduDataCell(getEdLocation(edu.location)),
              eduDataCell(awardedLabel(edu.wasAwarded)),
              eduDataCell(edu.date),
            ],
          }),
        )
      : [
          new TableRow({
            height: { value: 58, rule: HeightRule.ATLEAST },
            cantSplit: true,
            children: ['-', '-', '-', '-', '-', '-'].map(() => eduDataCell('-')),
          }),
        ]),
  ];

  return new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [1653, 1901, 2684, 1712, 1524, 1316],
    rows,
    width: { size: 0, type: WidthType.AUTO },
    borders: {
      top: TABLE_BORDER, bottom: TABLE_BORDER, left: TABLE_BORDER,
      right: TABLE_BORDER, insideHorizontal: TABLE_BORDER, insideVertical: TABLE_BORDER,
    },
  });
}

// ── Certifications table ───────────────────────────────────────────────────

function buildCertificationsTable(data: ResumeData): Table {
  const certHdrCell = (w: number, runs: TextRun[]) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
          children: runs,
        }),
      ],
    });

  const certDataCell = (v: unknown) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
          children: [new TextRun({ text: text(v).trim() || '-', font: 'Calibri', size: 22 })],
        }),
      ],
    });

  const certs = objList<OhioCertificationEntry>(data.certifications);
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        certHdrCell(3417, [new TextRun({ text: 'Certification', bold: true, font: 'Arial', size: 20 })]),
        certHdrCell(2424, [new TextRun({ text: 'Issued By', bold: true, font: 'Arial', size: 20 })]),
        certHdrCell(1834, [new TextRun({ text: 'Date Obtained', bold: true, font: 'Arial', size: 20 }), new TextRun({ text: ' (MM/YY)', font: 'Arial', size: 20 })]),
        certHdrCell(1644, [new TextRun({ text: 'Certification Number', bold: true, font: 'Arial', size: 20 }), new TextRun({ text: ' (If Applicable)', font: 'Arial', size: 20 })]),
        certHdrCell(1471, [new TextRun({ text: 'Expiration Date', bold: true, font: 'Arial', size: 20 }), new TextRun({ text: ' (If Applicable)', font: 'Arial', size: 20 })]),
      ],
    }),
    ...(certs.length > 0
      ? certs.map(cert =>
          new TableRow({
            height: { value: 58, rule: HeightRule.ATLEAST },
            cantSplit: true,
            children: [
              certDataCell(cert.name),
              certDataCell(cert.issuedBy),
              certDataCell(cert.dateObtained),
              certDataCell(cert.certificationNumber),
              certDataCell(cert.expirationDate),
            ],
          }),
        )
      : [
          new TableRow({
            height: { value: 58, rule: HeightRule.ATLEAST },
            cantSplit: true,
            children: ['-', '-', '-', '-', '-'].map(() => certDataCell('-')),
          }),
        ]),
  ];

  return new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [3417, 2424, 1834, 1644, 1471],
    rows,
    width: { size: 0, type: WidthType.AUTO },
    borders: {
      top: TABLE_BORDER, bottom: TABLE_BORDER, left: TABLE_BORDER,
      right: TABLE_BORDER, insideHorizontal: TABLE_BORDER, insideVertical: TABLE_BORDER,
    },
  });
}

// ── Employment history paragraphs ──────────────────────────────────────────

const hdrTabPara = (left: unknown, right: unknown, spaceBefore = 0) =>
  new Paragraph({
    tabStops: [RIGHT_TAB],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { ...BODY_SPACING, before: spaceBefore },
    children: [
      new TextRun({ text: text(left), bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
      new TextRun({ text: '\t' }),
      new TextRun({ text: text(right), bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
    ],
  });

const bulletPara = (t: unknown, level: 0 | 1 = 0) =>
  new Paragraph({
    numbering: { reference: 'resumeBullet', level },
    alignment: AlignmentType.JUSTIFIED,
    spacing: BODY_SPACING,
    children: [new TextRun({ text: stripBullet(t), font: 'Calibri', size: 22, boldComplexScript: true })],
  });

const SP = { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } as const;

const plain = (t: unknown) =>
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: SP, children: [new TextRun({ text: text(t), font: 'Calibri', size: 22 })] });

// Plain black bold label — the team flagged colored "Responsibilities" headings.
const boldLabel = (t: unknown) =>
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: SP, children: [new TextRun({ text: text(t), bold: true, font: 'Calibri', size: 22 })] });

const blankLine = () =>
  new Paragraph({ spacing: SP, children: [] });

const keyTechPara = (value: unknown) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { ...SP, before: 120 },
    children: [
      new TextRun({ text: 'Key Technologies/Skills: ', bold: true, font: 'Calibri', size: 22 }),
      new TextRun({ text: text(value), font: 'Calibri', size: 22 }),
    ],
  });

/**
 * A "Responsibilities" block: a heading, then one bullet per line.
 *
 * These used to be joined with ", " into a single justified paragraph, so a
 * project with thirty responsibilities printed as one unreadable block of
 * comma-spliced sentences — while the on-screen preview showed a bullet list.
 * The recruiter approved a list and submitted a wall of text. A job's own
 * responsibilities were always bulleted; a project's and a subsection's are
 * the same kind of content and now render the same way.
 */
function respBullets(items: unknown): Paragraph[] {
  const bullets = responsibilityBullets(items).map(r => bulletPara(r.text, r.level));
  return bullets.length ? [boldLabel('Responsibilities'), ...bullets] : [];
}


function buildEmploymentHistory(data: ResumeData): Paragraph[] {
  const jobs = objList<OhioEmploymentEntry>(data.employmentHistory);
  if (!jobs.length) return [plain('No employment history')];

  const paras: Paragraph[] = [];

  jobs.forEach((job, idx) => {
    try {
      const loc = resolveJobLocation(job.location);
      const dept = text(job.department ?? job.subRole).trim();
      const period = formatDatePeriod(job.workPeriod);

      if (idx > 0) paras.push(blankLine());

      paras.push(hdrTabPara(text(job.companyName) || 'Company', period, 0));

      if (loc) {
        paras.push(hdrTabPara(text(job.roleName) || 'Role', loc));
      } else {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            children: [new TextRun({ text: text(job.roleName) || 'Role', bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' })],
          }),
        );
      }

      if (dept) paras.push(plain(dept));

      paras.push(...respBullets(job.responsibilities));

      const projects = objList<OhioProjectEntry>(job.projects);
      projects.forEach((proj, pi) => {
        const base = formatProjectTitle(proj as unknown as Record<string, unknown>, pi, projects.length);
        paras.push(boldLabel(projectHeading(proj, base, job.companyName)));
        paras.push(...respBullets(proj.projectResponsibilities));
        if (text(proj.keyTechnologies).trim()) paras.push(keyTechPara(proj.keyTechnologies));
      });

      objList<OhioSubsection>(job.subsections).forEach(sub => {
        const title = text(sub.title).trim();
        if (title) paras.push(boldLabel(title + ':'));
        paras.push(...respBullets(sub.content));
      });

      if (text(job.keyTechnologies).trim()) paras.push(keyTechPara(job.keyTechnologies));
    } catch (e) {
       
      console.error('employment entry could not be rendered', e);
      paras.push(plain(`[${text(job.companyName) || 'Employment entry'} could not be rendered]`));
    }
  });

  return paras;
}

// ── Skills paragraphs ──────────────────────────────────────────────────────

function buildSkills(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  const sp = { after: 0, line: 240, lineRule: LineRuleType.AUTO };

  const skillLine = (label: unknown, skills: unknown, indent = 0) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: sp,
      ...(indent ? { indent: { left: indent } } : {}),
      children: [
        new TextRun({ text: text(label) + ': ', bold: true, boldComplexScript: true, font: 'Calibri' }),
        new TextRun({ text: textList(skills).join(', '), boldComplexScript: true, font: 'Calibri' }),
      ],
    });

  const technical = data.technicalSkills;
  if (technical && typeof technical === 'object' && Object.keys(technical).length) {
    Object.entries(technical).forEach(([cat, skills]) => paras.push(skillLine(cat, skills)));
  }

  const categories = objList<{ categoryName?: string; skills?: unknown; subCategories?: unknown }>(data.skillCategories);
  if (categories.length) {
    const normal: { categoryName: string; skills: string[]; subCategories: unknown }[] = [];
    const flat: string[] = [];
    categories.forEach(c => {
      const sl = textList(c.skills);
      const subs = objList(c.subCategories);
      // A category with a name but no skills is a skill the engine mistook for
      // a heading; keep the text rather than printing an empty label.
      if (!sl.length && !subs.length) flat.push(text(c.categoryName));
      else normal.push({ categoryName: text(c.categoryName) || 'Category', skills: sl, subCategories: subs });
    });
    if (flat.filter(Boolean).length) {
      normal.push({ categoryName: 'Other Technical Skills', skills: flat.filter(Boolean), subCategories: [] });
    }
    normal.forEach(c => {
      paras.push(skillLine(c.categoryName, c.skills));
      objList<{ name?: string; skills?: unknown }>(c.subCategories).forEach(sub =>
        paras.push(skillLine(text(sub.name) || 'Subcategory', sub.skills, 350)),
      );
    });
  }

  if (!paras.length) {
    paras.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: sp, children: [new TextRun({ text: 'No skills provided', font: 'Calibri' })] }));
  }
  return paras;
}

// ── Public API ─────────────────────────────────────────────────────────────

/** What separates the Ohio form from the Pennsylvania one. */
export interface SubmissionFormOptions {
  /** The system the requisition number belongs to: VectorVMS, PeopleFluent. */
  requisitionSystem: string;
}

/**
 * Assemble the document, without writing it anywhere.
 *
 * Split out from the download helper so the layout can be built and inspected
 * off a browser: saveAs needs a DOM, which meant the only way to see what this
 * produces was to download it and open Word. A rendering bug reaches whoever
 * the resume was submitted to, so it needs to be checkable in a test.
 */
export function buildSubmissionFormDocument(data: ResumeData, opts: SubmissionFormOptions): Document {
  const sectionHdrRun = (t: string) =>
    new TextRun({ text: t, bold: true, size: 28, color: '1F497D', font: 'Times New Roman' });
  const sectionHdr = (t: string) =>
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200, line: 276, lineRule: LineRuleType.AUTO }, children: [sectionHdrRun(t)] });
  const tightHdr = (t: string) =>
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO }, children: [sectionHdrRun(t)] });
  const spacer = (after = 0) =>
    new Paragraph({ spacing: { after, line: 240, lineRule: LineRuleType.AUTO }, children: [] });

  // A section that cannot be rendered costs its own content and says so, in
  // place of the whole export failing with "The document could not be built."
  const section = (build: () => (Paragraph | Table)[]) =>
    safely<Paragraph | Table>(build, () => [
      new Paragraph({
        spacing: BODY_SPACING,
        children: [new TextRun({ text: '[This section could not be rendered]', font: 'Calibri', size: 22, italics: true })],
      }),
    ]);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Calibri', cs: 'Times New Roman' }, size: 22 },
        },
      },
      paragraphStyles: [{
        id: 'ListParagraph', name: 'List Paragraph', basedOn: 'Normal', quickFormat: true,
        paragraph: { indent: { left: 360, hanging: 360 }, contextualSpacing: true },
      }],
    },
    numbering: {
      config: [{
        reference: 'resumeBullet',
        levels: [
          {
            level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360, hanging: 360 } }, run: { font: 'Calibri', size: 22 } },
          },
          // Sub-bullets (○ in the source) used to be comma-joined into their
          // parent. They keep their own line, one indent in.
          {
            level: 1, format: LevelFormat.BULLET, text: '○', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } }, run: { font: 'Calibri', size: 22 } },
          },
        ],
      }],
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 720, right: 720, bottom: 720, left: 720, header: 288, footer: 288, gutter: 0 } },
      },
      children: [
        // Name
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
          children: [new TextRun({ text: text(data.name) || 'Full Name', bold: true, size: 36, color: '1F497D', font: 'Times New Roman' })],
        }),
        // Title / Requisition row — spaced down from the name line
        new Paragraph({
          tabStops: [RIGHT_TAB],
          spacing: { ...BODY_SPACING, before: 120 },
          children: [
            new TextRun({ text: 'Title/Role:', bold: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: `${opts.requisitionSystem} Requisition Number:`, bold: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
          ],
        }),
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.JUSTIFIED,
          spacing: BODY_SPACING,
          children: [
            new TextRun({ text: text(data.title) }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: text(data.requisitionNumber) }),
          ],
        }),
        spacer(),
        // Education
        sectionHdr('Education:'),
        ...section(() => [buildEducationTable(data)]),
        spacer(200),
        // Certifications
        sectionHdr('Certifications and Certificates:'),
        ...section(() => [buildCertificationsTable(data)]),
        spacer(200),
        // Employment History
        sectionHdr('Employment History:'),
        ...section(() => buildEmploymentHistory(data)),
        // Standalone Projects — preview shows them; the DOCX previously dropped them
        ...(objList(data.projects).length
          ? [spacer(), sectionHdr('Projects:'), ...section(() => buildProjectsDocx(data, { font: 'Calibri', bulletRef: 'resumeBullet', sectionHdr }))]
          : []),
        // Professional Summary
        spacer(),
        tightHdr('Professional Summary'),
        ...section(() => [
          ...textList(data.professionalSummary).flatMap(pt =>
            splitProseToBullets(pt).map(
              item =>
                new Paragraph({
                  numbering: { reference: 'resumeBullet', level: 0 },
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: BODY_SPACING,
                  children: [new TextRun({ text: stripBullet(item), font: 'Calibri', size: 22, boldComplexScript: true })],
                }),
            ),
          ),
          ...objList<OhioSubsection>(data.summarySections ?? data.subsections).flatMap(sec => [
            ...(text(sec.title).trim()
              ? [new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: BODY_SPACING, children: [new TextRun({ text: text(sec.title), bold: true, font: 'Calibri', size: 22 })] })]
              : []),
            ...textList(sec.content).map(
              item =>
                new Paragraph({
                  numbering: { reference: 'resumeBullet', level: 0 },
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: BODY_SPACING,
                  children: [new TextRun({ text: stripBullet(item), font: 'Calibri', size: 22 })],
                }),
            ),
          ]),
        ]),
        // Technical Skills
        spacer(),
        tightHdr('Technical Skills'),
        ...section(() => buildSkills(data)),
        // Patents, conferences, courses, training, references.
        ...section(() => buildSupplementalDocx(data, { font: 'Calibri', bulletRef: 'resumeBullet', sectionHdr })),
      ],
    }],
  });

  return doc;
}
