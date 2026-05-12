import {
  Document, Packer, Paragraph, Table, TableCell, TableRow,
  TextRun, BorderStyle, AlignmentType, WidthType, ShadingType,
  VerticalAlign, LevelFormat, TabStopType, LineRuleType, HeightRule,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet, normalizeMonthAbbr, splitProseToBullets, sortEducation,
  formatLocation, getEdLocation, formatProjectTitle,
  groupResponsibilities,
  BODY_SPACING, RIGHT_TAB, TABLE_BORDER,
} from './shared';

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

  const eduDataCell = (text: string) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
          children: [new TextRun({ text: text || '-', font: 'Calibri', size: 22 })],
        }),
      ],
    });

  const sorted = sortEducation(data.education || []);
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
              eduDataCell(edu.degree ?? ''),
              eduDataCell(edu.areaOfStudy ?? ''),
              eduDataCell(edu.school ?? ''),
              eduDataCell(getEdLocation(edu.location)),
              eduDataCell(edu.wasAwarded ? 'Yes' : 'No'),
              eduDataCell(edu.date ?? ''),
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

  const certDataCell = (text: string) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
          children: [new TextRun({ text: text || '-', font: 'Calibri', size: 22 })],
        }),
      ],
    });

  const certs = data.certifications ?? [];
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
              certDataCell(cert.name ?? ''),
              certDataCell(cert.issuedBy ?? ''),
              certDataCell(cert.dateObtained ?? ''),
              certDataCell(cert.certificationNumber ?? ''),
              certDataCell(cert.expirationDate ?? ''),
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

const hdrTabPara = (left: string, right: string, spaceBefore = 0) =>
  new Paragraph({
    tabStops: [RIGHT_TAB],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { ...BODY_SPACING, before: spaceBefore },
    children: [
      new TextRun({ text: left, bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
      new TextRun({ text: '\t' }),
      new TextRun({ text: right, bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
    ],
  });

const bulletPara = (text: string) =>
  new Paragraph({
    numbering: { reference: 'resumeBullet', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: BODY_SPACING,
    children: [new TextRun({ text: stripBullet(text), font: 'Calibri', size: 22, boldComplexScript: true })],
  });

const SP = { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } as const;

const plain = (text: string) =>
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: SP, children: [new TextRun({ text, font: 'Calibri', size: 22 })] });

const boldLabel = (text: string) =>
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: SP, children: [new TextRun({ text, bold: true, font: 'Calibri', size: 22, color: '1F497D' })] });

const blankLine = () =>
  new Paragraph({ spacing: SP, children: [] });

function respLine(items: string[]): Paragraph[] {
  const cleaned = items.map(r => stripBullet(r.trim())).filter(Boolean);
  if (!cleaned.length) return [];
  return [
    boldLabel('Responsibilities'),
    plain(cleaned.join(', ')),
  ];
}

function resolveJobLocation(raw: string): string {
  const f = formatLocation(raw);
  return /^(remote|work from home|wfh|n\/a)$/i.test(f.trim()) ? '' : f;
}

function buildEmploymentHistory(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  if (!data.employmentHistory?.length) {
    paras.push(plain('No employment history'));
    return paras;
  }

  data.employmentHistory.forEach((job, idx) => {
    try {
      const loc = resolveJobLocation(job.location ?? '');
      const dept = (job.department ?? job.subRole ?? '').trim();
      const period = normalizeMonthAbbr(job.workPeriod ?? '');

      if (idx > 0) paras.push(blankLine());

      paras.push(hdrTabPara(job.companyName ?? 'Company', period, 0));

      if (loc) {
        paras.push(hdrTabPara(job.roleName ?? 'Role', loc));
      } else {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            children: [new TextRun({ text: job.roleName ?? 'Role', bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' })],
          }),
        );
      }

      if (dept) paras.push(plain(dept));

      // Main responsibilities → bullets; sub-bullets (○) grouped, prose-split per item.
      const liveResps = (job.responsibilities ?? []).filter(r => r.trim());
      const mainResps = groupResponsibilities(liveResps).flatMap(splitProseToBullets);
      if (mainResps.length) {
        paras.push(boldLabel('Responsibilities'));
        mainResps.forEach(r => paras.push(bulletPara(r)));
      }

      // Sub-projects → comma-joined sub-responsibilities
      (job.projects ?? []).forEach((proj, pi) => {
        const title = formatProjectTitle(proj as unknown as Record<string, unknown>, pi, (job.projects ?? []).length);
        paras.push(boldLabel(title));
        paras.push(...respLine(proj.projectResponsibilities ?? []));
        if (proj.keyTechnologies) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              children: [
                new TextRun({ text: 'Key Technologies/Skills: ', bold: true, font: 'Calibri', size: 22 }),
                new TextRun({ text: proj.keyTechnologies, font: 'Calibri', size: 22 }),
              ],
            }),
          );
        }
      });

      // Subsections → comma-joined content
      (job.subsections ?? []).forEach(sub => {
        if (sub.title) paras.push(boldLabel(sub.title + ':'));
        paras.push(...respLine(sub.content ?? []));
      });

      if (job.keyTechnologies) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            children: [
              new TextRun({ text: 'Key Technologies/Skills: ', bold: true, font: 'Calibri', size: 22 }),
              new TextRun({ text: job.keyTechnologies, font: 'Calibri', size: 22 }),
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

// ── Skills paragraphs ──────────────────────────────────────────────────────

function buildSkills(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  const sp = { after: 0, line: 240, lineRule: LineRuleType.AUTO };

  if (data.technicalSkills && Object.keys(data.technicalSkills).length) {
    Object.entries(data.technicalSkills).forEach(([cat, skills]) => {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: sp,
          children: [
            new TextRun({ text: cat + ': ', bold: true, boldComplexScript: true, font: 'Calibri' }),
            new TextRun({ text: Array.isArray(skills) ? skills.join(', ') : String(skills), boldComplexScript: true, font: 'Calibri' }),
          ],
        }),
      );
    });
  }

  if (data.skillCategories?.length) {
    const normal: typeof data.skillCategories = [];
    const flat: string[] = [];
    data.skillCategories.forEach(c => {
      const sl = Array.isArray(c.skills) ? c.skills.filter(s => s?.trim()) : [];
      if (!sl.length && !c.subCategories?.length) flat.push(c.categoryName ?? '');
      else normal.push({ ...c, skills: sl });
    });
    if (flat.length) normal.push({ categoryName: 'Other Technical Skills', skills: flat, subCategories: [] });
    normal.forEach(c => {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: sp,
          children: [
            new TextRun({ text: (c.categoryName ?? 'Category') + ': ', bold: true, boldComplexScript: true, font: 'Calibri' }),
            new TextRun({ text: Array.isArray(c.skills) ? c.skills.join(', ') : '', boldComplexScript: true, font: 'Calibri' }),
          ],
        }),
      );
      (c.subCategories ?? []).forEach(sub => {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: sp,
            indent: { left: 350 },
            children: [
              new TextRun({ text: (sub.name ?? 'Subcategory') + ': ', bold: true, boldComplexScript: true, font: 'Calibri' }),
              new TextRun({ text: Array.isArray(sub.skills) ? sub.skills.join(', ') : '', boldComplexScript: true, font: 'Calibri' }),
            ],
          }),
        );
      });
    });
  }

  if (!paras.length) {
    paras.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: sp, children: [new TextRun({ text: 'No skills provided', font: 'Calibri' })] }));
  }
  return paras;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function buildOhioDocx(data: ResumeData): Promise<void> {
  const sectionHdrRun = (t: string) =>
    new TextRun({ text: t, bold: true, size: 28, color: '1F497D', font: 'Times New Roman' });
  const sectionHdr = (t: string) =>
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200, line: 276, lineRule: LineRuleType.AUTO }, children: [sectionHdrRun(t)] });
  const tightHdr = (t: string) =>
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO }, children: [sectionHdrRun(t)] });
  const spacer = (after = 0) =>
    new Paragraph({ spacing: { after, line: 240, lineRule: LineRuleType.AUTO }, children: [] });

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
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 360 } }, run: { font: 'Calibri', size: 22 } },
        }],
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
          children: [new TextRun({ text: data.name ?? 'Full Name', bold: true, size: 36, color: '1F497D', font: 'Times New Roman' })],
        }),
        // Title / Requisition row
        new Paragraph({
          tabStops: [RIGHT_TAB],
          spacing: BODY_SPACING,
          children: [
            new TextRun({ text: 'Title/Role:', bold: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: 'VectorVMS Requisition Number:', bold: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
          ],
        }),
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.JUSTIFIED,
          spacing: BODY_SPACING,
          children: [
            new TextRun({ text: data.title ?? '' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: data.requisitionNumber ?? '' }),
          ],
        }),
        spacer(),
        // Education
        sectionHdr('Education:'),
        buildEducationTable(data),
        spacer(200),
        // Certifications
        sectionHdr('Certifications and Certificates:'),
        buildCertificationsTable(data),
        spacer(200),
        // Employment History
        sectionHdr('Employment History:'),
        ...buildEmploymentHistory(data),
        // Professional Summary
        spacer(),
        tightHdr('Professional Summary'),
        ...(data.professionalSummary ?? []).flatMap(pt =>
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
        ...(data.summarySections ?? data.subsections ?? []).flatMap(sec => [
          ...(sec.title
            ? [new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: BODY_SPACING, children: [new TextRun({ text: sec.title, bold: true, font: 'Calibri', size: 22 })] })]
            : []),
          ...(sec.content ?? []).map(
            item =>
              new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: BODY_SPACING, children: [new TextRun({ text: item, font: 'Calibri', size: 22 })] }),
          ),
        ]),
        // Technical Skills
        spacer(),
        tightHdr('Technical Skills'),
        ...buildSkills(data),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.name ?? 'Resume'}_Ohio.docx`);
}
