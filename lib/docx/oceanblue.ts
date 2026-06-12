import {
  Document, Packer, Paragraph, ImageRun,
  TextRun, AlignmentType, LevelFormat,
  LineRuleType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet,
  normalizeMonthAbbr,
  sortEducation,
  getEdLocation,
  formatLocation,
  groupResponsibilities,
  splitProseToBullets,
  BODY_SPACING,
  RIGHT_TAB,
} from './shared';

// ── Constants (no colors — all black) ──────────────────────────────────────

const SP      = { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } as const;
const SP_AFTER = { before: 0, after: 80, line: 240, lineRule: LineRuleType.AUTO } as const;

// ── Location helper ────────────────────────────────────────────────────────

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

const plain = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: SP,
    children: [new TextRun({ text, font: 'Calibri', size: 22 })],
  });

const centeredPlain = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: SP,
    children: [new TextRun({ text, font: 'Calibri', size: 22 })],
  });

const bulletPara = (text: string) =>
  new Paragraph({
    numbering: { reference: 'resumeBullet', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: BODY_SPACING,
    children: [new TextRun({ text: stripBullet(text), font: 'Calibri', size: 22 })],
  });

const blankLine = () =>
  new Paragraph({ spacing: { before: 0, after: 60, line: 240, lineRule: LineRuleType.AUTO }, children: [] });

// ── Employment history ─────────────────────────────────────────────────────

function buildEmployment(data: ResumeData): Paragraph[] {
  const paras: Paragraph[] = [];
  if (!data.employmentHistory?.length) return paras;

  data.employmentHistory.forEach((job, idx) => {
    try {
      const loc    = resolveJobLocation(job.location ?? '');
      const period = normalizeMonthAbbr(job.workPeriod ?? '');

      if (idx > 0) paras.push(blankLine());

      // Company (bold left) + Period (right)
      paras.push(
        new Paragraph({
          tabStops: [RIGHT_TAB],
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: job.companyName ?? 'Company', bold: true, size: 26, font: 'Calibri' }),
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
            new TextRun({ text: job.roleName ?? 'Role', italics: true, size: 22, font: 'Calibri' }),
            ...(loc
              ? [new TextRun({ text: '\t' }), new TextRun({ text: loc, size: 20, font: 'Calibri' })]
              : []),
          ],
        }),
      );

      // Responsibility bullets: group sub-bullets first, then prose-split per item.
      const liveResps = (job.responsibilities ?? []).filter(r => r.trim());
      const grouped = groupResponsibilities(liveResps).flatMap(splitProseToBullets);
      grouped.forEach(r => paras.push(bulletPara(r)));

      // Sub-projects (consulting structure)
      (job.projects ?? []).forEach((proj, pi) => {
        const title    = proj.projectName || `Project ${pi + 1}`;
        const subResps = (proj.projectResponsibilities ?? []).filter(r => r.trim());

        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            indent: { left: 360 },
            children: [new TextRun({ text: title, bold: true, size: 22, font: 'Calibri' })],
          }),
        );

        if (subResps.length) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              indent: { left: 360 },
              children: [
                new TextRun({ text: subResps.map(r => stripBullet(r)).join(', '), size: 22, font: 'Calibri' }),
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
                new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Calibri' }),
                new TextRun({ text: proj.keyTechnologies, size: 20, font: 'Calibri' }),
              ],
            }),
          );
        }
      });

      // Subsections
      (job.subsections ?? []).forEach(sub => {
        if (sub.title) {
          paras.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: SP,
              children: [new TextRun({ text: sub.title + ':', bold: true, size: 22, font: 'Calibri' })],
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
                new TextRun({ text: items.map(r => stripBullet(r)).join(', '), size: 22, font: 'Calibri' }),
              ],
            }),
          );
        }
      });

      if (job.keyTechnologies) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { ...SP, before: 120 },
            children: [
              new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: job.keyTechnologies, size: 20, font: 'Calibri' }),
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

// ── Standalone Projects ────────────────────────────────────────────────────

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
          new TextRun({ text: proj.name ?? '', bold: true, size: 26, font: 'Calibri' }),
          ...(proj.date
            ? [new TextRun({ text: '\t' }), new TextRun({ text: proj.date, size: 22, font: 'Calibri' })]
            : []),
        ],
      }),
    );

    if (proj.role) {
      paras.push(
        new Paragraph({
          spacing: SP,
          children: [new TextRun({ text: proj.role, italics: true, size: 22, font: 'Calibri' })],
        }),
      );
    }

    if (proj.description) {
      paras.push(plain(proj.description));
    }

    (proj.highlights ?? []).forEach(h => paras.push(bulletPara(h)));

    if ((proj.technologies ?? []).length) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: 'Technologies: ', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: proj.technologies!.join(', '), size: 20, font: 'Calibri' }),
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

  if (data.technicalSkills && Object.keys(data.technicalSkills).length) {
    Object.entries(data.technicalSkills).forEach(([cat, skills]) => {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: cat + ': ', bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: Array.isArray(skills) ? skills.join(', ') : String(skills), size: 22, font: 'Calibri' }),
          ],
        }),
      );
    });
  }

  if (data.skillCategories?.length) {
    const normal: typeof data.skillCategories = [];
    data.skillCategories.forEach(c => {
      const sl = Array.isArray(c.skills) ? c.skills.filter(s => s?.trim()) : [];
      if (sl.length || c.subCategories?.length) normal.push({ ...c, skills: sl });
    });

    normal.forEach(c => {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: SP,
          children: [
            new TextRun({ text: (c.categoryName ?? 'Category') + ': ', bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: Array.isArray(c.skills) ? c.skills.join(', ') : '', size: 22, font: 'Calibri' }),
          ],
        }),
      );
      (c.subCategories ?? []).forEach(sub => {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: SP,
            indent: { left: 360 },
            children: [
              new TextRun({ text: (sub.name ?? '') + ': ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: Array.isArray(sub.skills) ? sub.skills.join(', ') : '', size: 22, font: 'Calibri' }),
            ],
          }),
        );
      });
    });
  }

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
        ...(degreeText ? [new TextRun({ text: degreeText, bold: true, size: 22, font: 'Calibri' })] : []),
        ...(school     ? [new TextRun({ text: (degreeText ? ' — ' : '') + school, size: 22, font: 'Calibri' })] : []),
        ...(date       ? [new TextRun({ text: '\t' }), new TextRun({ text: date, size: 22, font: 'Calibri' })] : []),
      ],
    });
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function buildOceanblueDocx(data: ResumeData): Promise<void> {
  const logo = await fetchLogoPng();

  const contactParts: string[] = [];
  if (data.email)    contactParts.push(data.email);
  if (data.phone)    contactParts.push(data.phone);
  if (data.linkedin) contactParts.push(shortenLinkedIn(data.linkedin));
  if (data.location) contactParts.push(data.location);
  const contactText = contactParts.join('  |  ');

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
        new TextRun({ text: data.name ?? 'Full Name', bold: true, size: 40, font: 'Calibri' }),
      ],
    }),
  );

  // Title (if present) — centered
  if (data.title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40, line: 240, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({ text: data.title, bold: true, size: 24, font: 'Calibri' }),
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
  if ((data.professionalSummary?.length ?? 0) > 0) {
    children.push(sectionHdr('Professional Summary'));
    (data.professionalSummary ?? [])
      .flatMap(splitProseToBullets)
      .forEach(pt => children.push(bulletPara(pt)));
  }

  // Technical Skills
  const skillParas = buildSkills(data);
  if (skillParas.length) {
    children.push(sectionHdr('Technical Skills'));
    children.push(...skillParas);
  }

  // Work Experience
  if ((data.employmentHistory?.length ?? 0) > 0) {
    children.push(sectionHdr('Work Experience'));
    children.push(...buildEmployment(data));
  }

  // Standalone Projects
  const projParas = buildProjects(data);
  if (projParas.length) {
    children.push(sectionHdr('Projects'));
    children.push(...projParas);
  }

  // Education (last)
  const eduParas = buildEducation(data);
  if (eduParas.length) {
    children.push(sectionHdr('Education'));
    children.push(...eduParas);
  }

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
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 360, hanging: 360 } },
            run: { font: 'Calibri', size: 22 },
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
  saveAs(blob, `${data.name ?? 'Resume'}_Oceanblue.docx`);
}
