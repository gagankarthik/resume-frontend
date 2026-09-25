/**
 * Marketing-site content that more than one page reads: the templates, the
 * FAQ, and the site origin. Template facts here are taken from the DOCX
 * builders in lib/docx — if a builder changes its section order or type,
 * change it here too, because these pages promise what the file contains.
 */

import type { TemplateId } from '@/components/landing/illustrations/Emblems';

export const ORIGIN = process.env.NEXT_APP_ORIGIN ?? 'https://hire.oceanbluecorp.com';

export type TemplatePage = {
  id: TemplateId;
  slug: string;
  name: string;
  /** Short line for menus and cards. */
  blurb: string;
  submittedThrough: string;
  intro: string;
  bestFor: string;
  masthead: string;
  order: string[];
  details: { title: string; body: string }[];
};

const SUBMISSION_FORM_ORDER = [
  'Name, title and requisition number',
  'Education (table)',
  'Certifications and certificates (table)',
  'Employment history',
  'Projects',
  'Professional summary',
  'Technical skills',
  'Patents, courses, training and references',
];

export const TEMPLATE_PAGES: TemplatePage[] = [
  {
    id: 'ohio',
    slug: 'ohio',
    name: 'Ohio',
    blurb: 'Submission form for VectorVMS requisitions',
    submittedThrough: 'VectorVMS',
    intro:
      'The Ohio submittal is a structured form rather than a free resume. Education and certifications go into fixed tables, and the VectorVMS requisition number sits in the header next to the role.',
    bestFor: 'Openings posted through VectorVMS',
    masthead: 'Name, then Title/Role and VectorVMS Requisition Number on one line',
    order: SUBMISSION_FORM_ORDER,
    details: [
      {
        title: 'Education table',
        body: 'Degree, area of study, school, location, whether the degree was awarded, and the date, in the six columns the form asks for.',
      },
      {
        title: 'Certifications table',
        body: 'Certification, issuer, date obtained, certification number and expiration date. Blank cells are marked with a dash rather than guessed.',
      },
      {
        title: 'Employment history',
        body: 'Each role carries its company, period, title and location, then its responsibilities and the key technologies used, exactly as the candidate listed them.',
      },
    ],
  },
  {
    id: 'pennsylvania',
    slug: 'pennsylvania',
    name: 'Pennsylvania',
    blurb: 'Submission form for PeopleFluent requisitions',
    submittedThrough: 'PeopleFluent',
    intro:
      'Pennsylvania uses the same structured submission form as Ohio, set up for PeopleFluent. The requisition number field and header follow the Commonwealth’s system.',
    bestFor: 'Openings posted through PeopleFluent',
    masthead: 'Name, then Title/Role and PeopleFluent Requisition Number on one line',
    order: SUBMISSION_FORM_ORDER,
    details: [
      {
        title: 'Requisition in the header',
        body: 'The PeopleFluent requisition number you enter in the editor is printed beside the role, so the reviewer can match the submittal to the opening.',
      },
      {
        title: 'Summary as bullets',
        body: 'A paragraph summary is split into bullets at sentence boundaries. The sentences themselves are left exactly as written.',
      },
      {
        title: 'Tables for credentials',
        body: 'Education and certifications are laid out in the form’s tables, one row per entry, with the columns the agency reviews against.',
      },
    ],
  },
  {
    id: 'georgia',
    slug: 'georgia',
    name: 'Georgia',
    blurb: 'Direct submittal, experience first',
    submittedThrough: 'Direct submittal',
    intro:
      'The Georgia format is a clean single-column resume that leads with employment history and closes with education. Nothing is trimmed to fit a page count.',
    bestFor: 'Direct submittals that want experience up front',
    masthead: 'Name in capitals, the role being submitted for, then a contact line',
    order: [
      'Name, role and contact line',
      'Employment history',
      'Projects',
      'Professional summary',
      'Technical skills',
      'Certifications',
      'Patents, courses, training and references',
      'Education',
    ],
    details: [
      {
        title: 'Experience leads',
        body: 'Employment history comes directly under the masthead, with company, period, role and location on two tabbed lines per job.',
      },
      {
        title: 'Education closes',
        body: 'Education is always the last section. Nothing is placed after it, as the format requires.',
      },
      {
        title: 'Contact line kept',
        body: 'Email, phone, LinkedIn and location are printed on one line under the name, and only if they appear in the source file.',
      },
    ],
  },
  {
    id: 'oceanblue',
    slug: 'oceanblue',
    name: 'Oceanblue',
    blurb: 'Letterhead resume for client presentation',
    submittedThrough: 'Client presentation',
    intro:
      'For clients without a template of their own. The Oceanblue format puts the company letterhead at the top and leads with the summary and skills a hiring manager scans first.',
    bestFor: 'Clients with no template of their own',
    masthead: 'Letterhead, then name, title and a contact line',
    order: [
      'Letterhead, name, title and contact line',
      'Professional summary',
      'Technical skills',
      'Work experience',
      'Projects',
      'Education',
      'Certifications',
      'Patents, courses, training and references',
    ],
    details: [
      {
        title: 'Skills before history',
        body: 'The summary and grouped technical skills come ahead of work experience, so the fit is visible on the first page.',
      },
      {
        title: 'Your letterhead',
        body: 'The document opens with the Oceanblue letterhead, so the resume goes out as your firm’s presentation of the candidate.',
      },
      {
        title: 'Grouped skills',
        body: 'Skills stay in the categories the candidate used, each on its own labelled line.',
      },
    ],
  },
];

export const templateBySlug = (slug: string) => TEMPLATE_PAGES.find(t => t.slug === slug);

export const FAQ_ITEMS = [
  {
    q: 'What files can I upload?',
    a: 'PDF, Word (.docx and .doc) and plain text, up to 20 MB. Scanned pages are read with OCR.',
  },
  {
    q: 'Does Blue-IQ Hire reword anything?',
    a: 'No. Bullets and descriptions are copied character for character. Only the layout changes.',
  },
  {
    q: 'What happens if a section is missed?',
    a: 'The record is checked against the original before you see it, and anything missing is flagged at the top of the editor.',
  },
  {
    q: 'Is candidate data stored?',
    a: 'The resume file is held in memory while it is read and never written to disk. The extracted record is kept in your browser for the editor, and an encrypted copy is kept for your organisation until you ask us to delete it. The talent map shows only employer, role, skills, experience and work location; names, emails, phone numbers and home addresses are never shown on it or exported.',
  },
  {
    q: 'Can one resume go to several states?',
    a: 'Yes. Extract once, then export to the Ohio, Pennsylvania, Georgia or Oceanblue template without uploading again.',
  },
  {
    q: 'How does matching pick the candidates?',
    a: 'Paste the job description and every resume in your account is scored against it from 0 to 100, with the skills that matched and the ones missing. Only resumes uploaded from your account are included.',
  },
  {
    q: 'Which template should I use?',
    a: 'Use the one the requisition names. Ohio for VectorVMS openings, Pennsylvania for PeopleFluent, Georgia for direct submittals, and Oceanblue when the client has no template of their own.',
  },
];

/** The example set drawn on the matching radar. Illustrative, not real candidates. */
export const RADAR_CANDIDATES = [
  { initials: 'SR', name: 'Sushma R.', score: 92, angle: -40 },
  { initials: 'BN', name: 'Bhargav N.', score: 88, angle: 60 },
  { initials: 'AK', name: 'Arun K.', score: 83, angle: 165 },
  { initials: 'PM', name: 'Priya M.', score: 71, angle: -125 },
  { initials: 'DL', name: 'Dana L.', score: 66, angle: 110 },
  { initials: 'JT', name: 'Jon T.', score: 58, angle: 15 },
  { initials: 'RV', name: 'Ravi V.', score: 52, angle: -150 },
];
