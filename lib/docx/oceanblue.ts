import {
  Document, Paragraph, ImageRun,
  TextRun, AlignmentType, LevelFormat,
  LineRuleType,
} from 'docx';
import type { ResumeData, OhioEducationEntry, OhioCertificationEntry, OhioEmploymentEntry, OhioProjectEntry, OhioSubsection, SimpleProject } from '@/lib/types';
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

// ── Constants (no colors — all black) ──────────────────────────────────────

const SP      = { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } as const;
const SP_AFTER = { before: 0, after: 80, line: 240, lineRule: LineRuleType.AUTO } as const;

// ── Location helper ────────────────────────────────────────────────────────




// ── Logo (WebP → PNG via canvas) ───────────────────────────────────────────

async function fetchLogoPng(): Promise<{ data: ArrayBuffer; width: number; height: number } | null> {
  try {
    const res = await fetch('/logo.webp');
    if (!res.ok) return null;
    const blob = await res.blob();

    const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload  = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });

    const MAX_W = 180;
    const scale = Math.min(1, MAX_W / (imgEl.naturalWidth || MAX_W));
    const w = Math.round((imgEl.naturalWidth  || MAX_W) * scale);
    const h = Math.round((imgEl.naturalHeight || 60)   * scale);

    const canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(imgEl, 0, 0, w, h);
    URL.revokeObjectURL(imgEl.src);

    const pngBlob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (!pngBlob) return null;

    return { data: await pngBlob.arrayBuffer(), width: w, height: h };
  } catch {
    return null;
  }
}

// ── Paragraph helpers ──────────────────────────────────────────────────────

const sectionHdr = (label: string) =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 180, after: 60, line: 240, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text: label.toUpperCase(),
        bold: true,
        size: 22,
        font: 'Calibri',
      }),
    ],
  });

const plain = (t: unknown) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: SP,
    children: [new TextRun({ text: text(t), font: 'Calibri', size: 22 })],
  });

const bulletPara = (t: unknown, level: 0 | 1 = 0, indent?: number) =>
  new Paragraph({
    numbering: { reference: 'resumeBullet', level },
    alignment: AlignmentType.JUSTIFIED,
    spacing: BODY_SPACING,
    ...(indent ? { indent: { left: indent } } : {}),
    children: [new TextRun({ text: stripBullet(t), font: 'Calibri', size: 22 })],
  });

/** One bullet per source line, keeping any sub-bullet nesting. */
const respBullets = (items: unknown, indent?: number) =>
  responsibilityBullets(items).map(r => bulletPara(r.text, r.level, indent));

const blankLine = () =>
  new Paragraph({ spacing: { before: 0, after: 60, line: 240, lineRule: LineRuleType.AUTO }, children: [] });

// ── Employment history ─────────────────────────────────────────────────────

function buildEmployment(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  const jobs = objList<OhioEmploymentEntry>(data.employmentHistory);
  if (!jobs.length) return paras;

  jobs.forEach((job, idx) => {
    try {
      const loc    = resolveJobLocation(job.location);
      const period = formatDatePeriod(job.workPeriod);

      if (idx > 0) paras.push(blankLine());

      // Company (bold left) + Period (right)
      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: text(job.companyName) || 'Company', bold: true, size: 26, font: 'Calibri' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: period, size: 22, font: 'Calibri' }),
          ],
        }),
      );

      // Role (italic left) + Location (right)
      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP_AFTER,
          children: [
            new TextRun({ text: text(job.roleName) || 'Role', italics: true, size: 22, font: 'Calibri' }),
            ...(loc
              ? [new TextRun({ text: '\t' }), new TextRun({ text: loc, size: 20, font: 'Calibri' })]
              : []),
          ],
        }),
      );

      const dept = text(job.department).trim();
      if (dept) paras.push(plain(dept));

      paras.push(...respBullets(job.responsibilities));

      // Sub-projects (consulting structure)
      objList<OhioProjectEntry>(job.projects).forEach((proj, pi) => {
        const title = projectTitleWithClient(proj, `Project ${pi + 1}`, job.companyName);

        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            indent: { left: 360 },
            children: [new TextRun({ text: title, bold: true, size: 22, font: 'Calibri' })],
          }),
        );

        // One bullet per responsibility, indented under the project. These
        // used to be comma-joined into a single run-on paragraph.
        paras.push(...respBullets(proj.projectResponsibilities, 720));

        if (text(proj.keyTechnologies).trim()) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              indent: { left: 360 },
              children: [
                new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Calibri' }),
                new TextRun({ text: text(proj.keyTechnologies), size: 20, font: 'Calibri' }),
              ],
            }),
          );
        }
      });

      // Subsections
      objList<OhioSubsection>(job.subsections).forEach(sub => {
        const title = text(sub.title).trim();
        if (title) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              children: [new TextRun({ text: title + ':', bold: true, size: 22, font: 'Calibri' })],
            }),
          );
        }
        paras.push(...respBullets(sub.content));
      });

      if (text(job.keyTechnologies).trim()) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { ...SP, before: 120 },
            children: [
              new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: text(job.keyTechnologies), size: 20, font: 'Calibri' }),
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

// ── Standalone Projects ────────────────────────────────────────────────────

function buildProjects(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  const projects = objList<SimpleProject>(data.projects);
  if (!projects.length) return paras;

  projects.forEach((proj, idx) => {
    if (idx > 0) paras.push(blankLine());

    paras.push(
      new Paragraph({
        tabStops: [RIGHT_TAB],
        alignment: AlignmentType.JUSTIFIED,
        spacing: SP,
        children: [
          new TextRun({ text: text(proj.name), bold: true, size: 26, font: 'Calibri' }),
          ...(text(proj.date).trim()
            ? [new TextRun({ text: '\t' }), new TextRun({ text: text(proj.date), size: 22, font: 'Calibri' })]
            : []),
        ],
      }),
    );

    if (text(proj.role).trim()) {
      paras.push(
        new Paragraph({
          spacing: SP,
          children: [new TextRun({ text: text(proj.role), italics: true, size: 22, font: 'Calibri' })],
        }),
      );
    }

    if (text(proj.description).trim()) {
      paras.push(plain(proj.description));
    }

    textList(proj.highlights).forEach(h => paras.push(bulletPara(h)));

    const tech = textList(proj.technologies);
    if (tech.length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: tech.join(', '), size: 20, font: 'Calibri' }),
          ],
        }),
      );
    }
  });

  return paras;
}

// ── Skills ─────────────────────────────────────────────────────────────────

function buildSkills(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];

  const skillLine = (label: unknown, skills: unknown, indent = 0) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: SP,
      ...(indent ? { indent: { left: indent } } : {}),
      children: [
        new TextRun({ text: text(label) + ': ', bold: true, size: 22, font: 'Calibri' }),
        new TextRun({ text: textList(skills).join(', '), size: 22, font: 'Calibri' }),
      ],
    });

  const technical = data.technicalSkills;
  if (technical && typeof technical === 'object' && Object.keys(technical).length) {
    Object.entries(technical).forEach(([cat, skills]) => paras.push(skillLine(cat, skills)));
  }

  objList<{ categoryName?: string; skills?: unknown; subCategories?: unknown }>(data.skillCategories)
    .forEach(c => {
      const sl = textList(c.skills);
      const subs = objList<{ name?: string; skills?: unknown }>(c.subCategories);
      if (!sl.length && !subs.length) return;
      paras.push(skillLine(text(c.categoryName) || 'Category', sl));
      subs.forEach(sub => paras.push(skillLine(text(sub.name), sub.skills, 360)));
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
      alignment: AlignmentType.JUSTIFIED,
      spacing: SP_AFTER,
      children: [
        ...(degreeText ? [new TextRun({ text: degreeText, bold: true, size: 22, font: 'Calibri' })] : []),
        ...(school     ? [new TextRun({ text: (degreeText ? ' — ' : '') + school, size: 22, font: 'Calibri' })] : []),
        ...(date       ? [new TextRun({ text: '\t' }), new TextRun({ text: date, size: 22, font: 'Calibri' })] : []),
      ],
    });
  });
}

// ── Certifications ─────────────────────────────────────────────────────────

function buildCertifications(data: ResumeData): Paragraph[] {
  return objList<OhioCertificationEntry>(data.certifications).map(cert => {
    const parts: string[] = [];
    const issuedBy = text(cert.issuedBy).trim();
    const obtained = text(cert.dateObtained).trim();
    if (issuedBy) parts.push(` — ${issuedBy}`);
    if (obtained) parts.push(` (${obtained})`);
    const suffix = parts.join('');
    return new Paragraph({
      numbering: { reference: 'resumeBullet', level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: BODY_SPACING,
      children: [
        new TextRun({ text: text(cert.name), bold: true, size: 22, font: 'Calibri' }),
        ...(suffix ? [new TextRun({ text: suffix, size: 22, font: 'Calibri' })] : []),
      ],
    });
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

type Logo = { data: ArrayBuffer; width: number; height: number } | null;

/**
 * Assemble the document, without writing it anywhere.
 *
 * Split from the download helper for the same reason as the submission form:
 * saveAs needs a DOM, so until this existed the layout could not be checked in
 * a test. The logo is passed in rather than fetched here, since fetching it
 * needs a browser too.
 */
export function buildOceanblueDocument(data: ResumeData, logo: Logo = null): Document {
  const contactText = contactLine(data).join('  |  ');

  const children: Paragraph[] = [];

  // Logo — left-aligned
  if (logo) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 100, line: 240, lineRule: LineRuleType.AUTO },
        children: [
          new ImageRun({
            data: logo.data,
            transformation: { width: logo.width, height: logo.height },
            type: 'png',
          }),
        ],
      }),
    );
  }

  // Name — centered
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40, line: 240, lineRule: LineRuleType.AUTO },
      children: [
        new TextRun({ text: text(data.name) || 'Full Name', bold: true, size: 40, font: 'Calibri' }),
      ],
    }),
  );

  // Title (if present) — centered
  if (text(data.title).trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40, line: 240, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({ text: text(data.title), bold: true, size: 24, font: 'Calibri' }),
        ],
      }),
    );
  }

  // Contact line — centered
  if (contactText) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160, line: 240, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({ text: contactText, size: 18, font: 'Calibri' }),
        ],
      }),
    );
  }

  // Professional Summary — bulleted list (matches preview rendering)
  const summaryPoints = textList(data.professionalSummary).flatMap(splitProseToBullets);
  if (summaryPoints.length) {
    children.push(sectionHdr('Professional Summary'));
    summaryPoints.forEach(pt => children.push(bulletPara(pt)));

    // Extra summary subsections — e.g. "Areas of Expertise"
    objList<OhioSubsection>(data.summarySections ?? data.subsections).forEach(sub => {
      const title = text(sub.title).trim();
      const items = textList(sub.content);
      if (!title && !items.length) return;
      if (title) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            children: [new TextRun({ text: title, bold: true, size: 22, font: 'Calibri' })],
          }),
        );
      }
      items.forEach(item => children.push(bulletPara(item)));
    });
  }

  // Technical Skills
  const skillParas = buildSkills(data);
  if (skillParas.length) {
    children.push(sectionHdr('Technical Skills'));
    children.push(...skillParas);
  }

  // Work Experience
  const jobParas = safely(() => buildEmployment(data), () => []);
  if (jobParas.length) {
    children.push(sectionHdr('Work Experience'));
    children.push(...jobParas);
  }

  // Standalone Projects
  const projParas = buildProjects(data);
  if (projParas.length) {
    children.push(sectionHdr('Projects'));
    children.push(...projParas);
  }

  // Education
  const eduParas = buildEducation(data);
  if (eduParas.length) {
    children.push(sectionHdr('Education'));
    children.push(...eduParas);
  }

  // Certifications — matches the preview
  const certParas = buildCertifications(data);
  if (certParas.length) {
    children.push(sectionHdr('Certifications'));
    children.push(...certParas);
  }

  // Awards, publications, languages, volunteer, patents, memberships,
  // conferences, courses, training, interests, references — shared builder.
  children.push(...buildSupplementalDocx(data, { font: 'Calibri', bulletRef: 'resumeBullet', sectionHdr }));

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Calibri' }, size: 22 },
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
        reference: 'resumeBullet',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 360, hanging: 360 } },
              run: { font: 'Calibri', size: 22 },
            },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: '○',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
              run: { font: 'Calibri', size: 22 },
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
export async function buildOceanblueDocx(data: ResumeData): Promise<void> {
  const logo = await fetchLogoPng();
  await downloadDocx(buildOceanblueDocument(data, logo), data, 'Oceanblue');
}
