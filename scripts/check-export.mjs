/**
 * Check what the exported .docx actually says.
 *
 * WHY THIS EXISTS
 *
 * Every export bug found so far was invisible from the code and invisible from
 * the preview: the builder ran without error, produced a file, and the file was
 * wrong. A project with thirty responsibilities came out as one comma-spliced
 * paragraph. A job's achievements printed its own bullets a second time. A
 * degenerate field threw, the throw escaped, and the recruiter got "The
 * document could not be built. Try again." with no file and nothing to act on.
 *
 * None of that is catchable by types or by reading. It needs the document
 * built, unzipped, and read back — which is what this does.
 *
 *   npm run test:export
 *
 * The fixtures below are shaped from the real resumes that produced those
 * bugs. If the extraction engine is checked out alongside this repo, its
 * recorded end-to-end output is exercised too, through the real mapper.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { createJiti } = await import(
  pathToFileURL(path.join(ROOT, 'node_modules/jiti/lib/jiti.mjs')).href
);
const jiti = createJiti(path.join(ROOT, 'scripts/check-export.mjs'), {
  alias: { '@': ROOT },
  interopDefault: true,
});
const load = rel => jiti.import(path.join(ROOT, rel));

const { Packer } = await jiti.import('docx');
const JSZip = await jiti.import('jszip');

const { buildOhioDocument } = await load('lib/docx/ohio.ts');
const { buildPADocument } = await load('lib/docx/pennsylvania.ts');
const { buildGeorgiaDocument } = await load('lib/docx/georgia.ts');
const { buildOceanblueDocument } = await load('lib/docx/oceanblue.ts');
const { mapToResumeData } = await load('lib/mapper.ts');

const FORMATS = {
  Ohio: buildOhioDocument,
  Pennsylvania: buildPADocument,
  Georgia: buildGeorgiaDocument,
  Oceanblue: buildOceanblueDocument,
};

// ── Reading a built document back ──────────────────────────────────────────

/** The document's paragraphs, as plain text, in order. */
async function paragraphsOf(doc) {
  const buf = await Packer.toBuffer(doc);
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml').async('string');
  return xml
    .split('</w:p>')
    .map(block =>
      (block.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) ?? [])
        .map(t => t.replace(/<[^>]+>/g, ''))
        .join('')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim(),
    )
    .filter(Boolean);
}

// ── Assertions ─────────────────────────────────────────────────────────────

let failures = 0;
let checks = 0;

function check(label, condition, detail = '') {
  checks++;
  if (!condition) {
    failures++;
    console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
  }
}

// ── Fixtures ───────────────────────────────────────────────────────────────

/** The bullets a consulting sub-project carries. Each must stay its own line. */
const PROJECT_BULLETS = [
  'Requirement gathering and GAP analysis for process order management.',
  'Configuration of batch management and batch search strategy.',
  'Unit test, integration test, UAT, training and sign off.',
  'Designed the MDM approach, data governance and data modeling.',
];

const SUB_BULLET_PARENT = 'Owned the release readiness review.';
const SUB_BULLETS = ['Entry criteria agreed with product.', 'Exit criteria signed off by QA.'];

const SHARED_RESPONSIBILITY =
  'Mentored a team of 3-4 junior QA engineers in Tosca script design, reducing new-hire ramp-up time by an estimated 20%.';

const resume = {
  name: 'Test Candidate',
  title: 'DCY - Help Desk Analyst 1',
  requisitionNumber: 'HDA1808942',
  education: [
    { degree: 'MS', areaOfStudy: 'Computer Science', school: 'Northern Virginia', location: 'VA', wasAwarded: true, date: 'Aug 2024' },
    { degree: 'BS', areaOfStudy: 'Mechanical Engineering', school: 'JNTU', location: 'India', wasAwarded: true, date: 'Sep 2020' },
  ],
  certifications: [
    { name: 'TOSCA AS1 Certified', issuedBy: 'Tricentis', dateObtained: 'Nov 2016' },
  ],
  employmentHistory: [
    {
      companyName: 'Office of the Attorney General, State of Texas',
      roleName: 'Senior Salesforce Developer',
      workPeriod: 'Mar 2025 – Aug 2025',
      location: 'Austin, TX',
      responsibilities: [SHARED_RESPONSIBILITY, SUB_BULLET_PARENT, ...SUB_BULLETS.map(s => `○ ${s}`)],
      projects: [
        {
          projectName: 'OAG - Order Gen',
          // The client IS the employer — naming it again is noise.
          clientName: 'Office of the Attorney General, State of Texas',
          projectResponsibilities: PROJECT_BULLETS,
        },
      ],
      subsections: [{ title: 'Environment', content: ['Apex', 'LWC'] }],
    },
  ],
  professionalSummary: ['QA Test Automation Architect with 16+ years of experience.'],
  skillCategories: [{ categoryName: 'TOSCA Platform', skills: ['AS1', 'AS2'] }],
};

// The engine returns achievements alongside responsibilities, and when it has
// no clean split it repeats them — verbatim, or as the clause it lifted out.
const apiWithDuplicateAchievements = {
  personal_information: { full_name: 'Test Candidate' },
  work_experience: [
    {
      company_name: 'Societe Generale',
      job_title: 'Automation Test Architect',
      responsibilities: [SHARED_RESPONSIBILITY, 'Led migration of 200+ Selenium scripts to Tosca.'],
      achievements: [
        SHARED_RESPONSIBILITY,                                  // verbatim repeat
        'reducing new-hire ramp-up time by an estimated 20%',   // clause of the above
        'Cut regression cycle time by 40%.',                    // genuinely new
      ],
    },
  ],
};

// Shapes that reach the builders from localStorage, from the editor, and from
// the passthrough fields the engine hands over exactly as the model wrote them.
const DEGENERATE = {
  'empty record': {},
  'null everywhere': {
    name: null, education: null, certifications: null, employmentHistory: null,
    professionalSummary: null, technicalSkills: null, skillCategories: null, projects: null,
  },
  'null entries': {
    name: 'X', education: [null], certifications: [null], employmentHistory: [null],
    skillCategories: [null], projects: [null], patents: [null], references: [null],
  },
  'non-string bullets': {
    name: 'X',
    employmentHistory: [{ companyName: 'C', responsibilities: [null, 7, ['a', 'b'], { x: 1 }, 'kept'] }],
  },
  'nested bullet arrays': {
    name: 'X',
    employmentHistory: [{ companyName: 'C', projects: [{ projectName: 'P', projectResponsibilities: [['one', 'two']] }] }],
  },
  'non-string summary': { name: 'X', professionalSummary: [null, 42, { text: 'hi' }] },
  'skills as odd shapes': {
    name: 'X',
    technicalSkills: { Cat: 'a, b', Other: null },
    skillCategories: [{ categoryName: 'C', skills: [null, 3, 'ok'] }],
  },
  'numeric name': { name: 12345 },
};

// ── Run ────────────────────────────────────────────────────────────────────

console.log('\nExport checks\n');

for (const [format, build] of Object.entries(FORMATS)) {
  console.log(`${format}`);
  const paras = await paragraphsOf(build(resume));
  const joined = paras.join('\n');

  // 1. Every project responsibility is its own paragraph, and no paragraph
  //    carries two of them. This is the bug that shipped: all four fused into
  //    one comma-spliced block.
  for (const bullet of PROJECT_BULLETS) {
    check(
      `project bullet kept on its own line: "${bullet.slice(0, 40)}…"`,
      paras.includes(bullet),
      `not found as a standalone paragraph in ${format}`,
    );
  }
  check(
    'no paragraph fuses two project bullets',
    !paras.some(p => PROJECT_BULLETS.filter(b => p.includes(b)).length > 1),
    paras.find(p => PROJECT_BULLETS.filter(b => p.includes(b)).length > 1)?.slice(0, 120),
  );

  // 2. Sub-bullets keep their own lines rather than being comma-joined into
  //    the bullet above them.
  for (const sub of SUB_BULLETS) {
    check(`sub-bullet kept separate: "${sub}"`, paras.includes(sub));
  }
  check(
    'sub-bullets not merged into their parent',
    !paras.some(p => p.includes(SUB_BULLET_PARENT) && p.includes(SUB_BULLETS[0])),
  );

  // 3. A subsection's content is a list, not a run-on sentence.
  check('subsection content listed, not joined', paras.includes('Apex') && paras.includes('LWC'));

  // 4. The client is not repeated when it is the employer.
  check(
    'employer not repeated as project client',
    !joined.includes('— Client: Office of the Attorney General'),
    joined.split('\n').find(p => p.includes('Client:')),
  );

  // 5. What the recruiter typed reaches the file.
  check('title/role present', joined.includes('DCY - Help Desk Analyst 1'));
  if (format === 'Ohio' || format === 'Pennsylvania') {
    check('requisition number present', joined.includes('HDA1808942'));
  }

  // 6. Education is in qualification order, the same order the preview shows.
  const bs = paras.findIndex(p => p === 'Mechanical Engineering');
  const ms = paras.findIndex(p => p === 'Computer Science');
  if (bs >= 0 && ms >= 0) check('education in qualification order (BS before MS)', bs < ms);

  // 7. Nothing is silently dropped.
  check('certification issuer kept', joined.includes('Tricentis'));
  check('skills kept', joined.includes('AS1'));

  // 8. No input shape can take the file down.
  for (const [label, data] of Object.entries(DEGENERATE)) {
    try {
      const buf = await Packer.toBuffer(build(data));
      check(`builds on ${label}`, buf.length > 0);
    } catch (e) {
      check(`builds on ${label}`, false, `${e.constructor.name}: ${String(e.message).split('\n')[0]}`);
    }
  }

  // 9. A degenerate record still renders whatever was salvageable.
  const partial = await paragraphsOf(build(DEGENERATE['non-string bullets']));
  check('a bad bullet costs only itself', partial.includes('kept'));
}

// ── Mapper: achievements must not repeat responsibilities ──────────────────

console.log('mapper');
{
  const mapped = mapToResumeData(apiWithDuplicateAchievements);
  const bullets = mapped.employmentHistory[0].responsibilities;
  check(
    'a repeated achievement is not printed twice',
    bullets.filter(b => b === SHARED_RESPONSIBILITY).length === 1,
    `got ${bullets.filter(b => b === SHARED_RESPONSIBILITY).length} copies`,
  );
  check(
    'a clause lifted out of a bullet is not printed again',
    !bullets.includes('reducing new-hire ramp-up time by an estimated 20%'),
  );
  check('an achievement that says something new is kept', bullets.includes('Cut regression cycle time by 40%.'));
}

// ── The engine's recorded end-to-end output, when it is checked out ────────

const RECORDED = path.resolve(
  ROOT, '..', 'resume-extraction-engine', 'tests', 'fixtures', 'long-career.recorded-output.json',
);

if (fs.existsSync(RECORDED)) {
  console.log('recorded extraction (real resume, through the real mapper)');
  const api = JSON.parse(fs.readFileSync(RECORDED, 'utf8'));
  const data = mapToResumeData(api);

  // Every responsibility the engine extracted must appear as its own bullet.
  const sourceBullets = [
    ...data.employmentHistory.flatMap(j => j.responsibilities ?? []),
    ...data.employmentHistory.flatMap(j => (j.projects ?? []).flatMap(p => p.projectResponsibilities ?? [])),
  ].filter(b => typeof b === 'string' && b.trim().length > 25);

  for (const [format, build] of Object.entries(FORMATS)) {
    const paras = await paragraphsOf(build(data));
    const missing = sourceBullets.filter(b => !paras.some(p => p === b.trim()));
    check(
      `${format}: every extracted responsibility is its own bullet`,
      missing.length === 0,
      missing.length ? `${missing.length}/${sourceBullets.length} missing, first: "${missing[0].slice(0, 90)}…"` : '',
    );
  }
} else {
  console.log('recorded extraction — skipped (extraction engine not checked out alongside)');
}

console.log(
  failures
    ? `\n${failures} of ${checks} checks failed\n`
    : `\nall ${checks} checks passed\n`,
);
process.exit(failures ? 1 : 0);
