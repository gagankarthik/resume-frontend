/**
 * The four output templates, drawn small.
 *
 * These miniatures echo the real DOCX each formatter produces, so the card a
 * user picks on the landing page matches the document they get.
 */

export type TemplateRow =
  | { t: 'brand' }
  | { t: 'title'; w: number }
  | { t: 'sub'; w: number }
  | { t: 'rule' }
  | { t: 'head'; text: string }
  | { t: 'line'; w: number }
  | { t: 'bullet'; w: number }
  | { t: 'row'; cols: number[] };

export type Template = {
  id: 'ohio' | 'pennsylvania' | 'georgia' | 'oceanblue';
  name: string;
  accent: string;
  second?: string;
  serif?: boolean;
  via: string;
  points: string[];
  rows: TemplateRow[];
};

export const TEMPLATES: Template[] = [
  {
    id: 'ohio',
    name: 'Ohio',
    accent: '#1F6FEB',
    via: 'VectorVMS',
    points: [
      'Education and certification tables',
      'Requisition number in header',
      'Work periods per role',
    ],
    rows: [
      { t: 'title', w: 54 },
      { t: 'sub', w: 38 },
      { t: 'row', cols: [30, 44] },
      { t: 'head', text: 'SUMMARY' },
      { t: 'line', w: 100 },
      { t: 'line', w: 86 },
      { t: 'head', text: 'TECHNICAL SKILLS' },
      { t: 'row', cols: [26, 68] },
      { t: 'row', cols: [26, 60] },
      { t: 'head', text: 'EDUCATION' },
      { t: 'row', cols: [34, 30, 26] },
      { t: 'head', text: 'EMPLOYMENT HISTORY' },
      { t: 'row', cols: [52, 32] },
      { t: 'bullet', w: 92 },
    ],
  },
  {
    id: 'pennsylvania',
    name: 'Pennsylvania',
    accent: '#002868',
    second: '#B88400',
    via: 'PeopleFluent',
    points: [
      'Commonwealth table layout',
      'Summary set as bullets',
      'Gold rule under the name',
    ],
    rows: [
      { t: 'title', w: 60 },
      { t: 'rule' },
      { t: 'row', cols: [28, 30, 28] },
      { t: 'head', text: 'PROFESSIONAL SUMMARY' },
      { t: 'bullet', w: 94 },
      { t: 'bullet', w: 80 },
      { t: 'head', text: 'SKILL MATRIX' },
      { t: 'row', cols: [30, 26, 30] },
      { t: 'row', cols: [30, 26, 30] },
      { t: 'head', text: 'EXPERIENCE' },
      { t: 'row', cols: [40, 26, 22] },
      { t: 'bullet', w: 90 },
      { t: 'bullet', w: 82 },
    ],
  },
  {
    id: 'georgia',
    name: 'Georgia',
    accent: '#BA0C2F',
    serif: true,
    via: 'Direct submittal',
    points: ['Seventeen sections', 'Serif document setting', 'Nothing trimmed to fit'],
    rows: [
      { t: 'title', w: 46 },
      { t: 'sub', w: 66 },
      { t: 'rule' },
      { t: 'head', text: 'Summary of Qualifications' },
      { t: 'line', w: 98 },
      { t: 'line', w: 90 },
      { t: 'line', w: 74 },
      { t: 'head', text: 'Areas of Expertise' },
      { t: 'line', w: 94 },
      { t: 'line', w: 68 },
      { t: 'head', text: 'Professional Experience' },
      { t: 'sub', w: 58 },
      { t: 'bullet', w: 96 },
      { t: 'bullet', w: 88 },
    ],
  },
  {
    id: 'oceanblue',
    name: 'Oceanblue',
    accent: '#1F6FEB',
    via: 'Client presentation',
    points: [
      'Company letterhead',
      'Skills ahead of experience',
      'For clients with no template',
    ],
    rows: [
      { t: 'brand' },
      { t: 'title', w: 50 },
      { t: 'sub', w: 62 },
      { t: 'head', text: 'CORE COMPETENCIES' },
      { t: 'row', cols: [30, 30, 30] },
      { t: 'row', cols: [30, 30, 30] },
      { t: 'head', text: 'PROFILE' },
      { t: 'line', w: 96 },
      { t: 'line', w: 84 },
      { t: 'head', text: 'ENGAGEMENTS' },
      { t: 'sub', w: 54 },
      { t: 'bullet', w: 92 },
      { t: 'bullet', w: 86 },
    ],
  },
];

export function TemplateRowMark({ row, tpl }: { row: TemplateRow; tpl: Template }) {
  const serif = tpl.serif ? { fontFamily: 'Georgia, "Times New Roman", serif' } : undefined;

  switch (row.t) {
    case 'brand':
      return (
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: tpl.accent }} />
          <span className="h-1.5 w-10 rounded-full" style={{ background: `${tpl.accent}59` }} />
        </div>
      );
    case 'title':
      return (
        <div
          className="mx-auto mb-1 h-[9px] rounded-[2px]"
          style={{ width: `${row.w}%`, background: tpl.accent }}
        />
      );
    case 'sub':
      return (
        <div
          className="mx-auto mb-1.5 h-[4px] rounded-full"
          style={{ width: `${row.w}%`, background: `${tpl.accent}4D` }}
        />
      );
    case 'rule':
      return <div className="mb-2 h-[2px] w-full" style={{ background: tpl.second ?? tpl.accent }} />;
    case 'head':
      return (
        <p
          className={`mb-1 mt-2.5 text-[6.5px] font-semibold leading-none ${
            tpl.serif ? '' : 'tracking-[0.14em]'
          }`}
          style={{ color: tpl.accent, ...serif }}
        >
          {row.text}
        </p>
      );
    case 'line':
      return (
        <div
          className="mb-[3px] h-[3.5px] rounded-full bg-slate-900/[0.17]"
          style={{ width: `${row.w}%` }}
        />
      );
    case 'bullet':
      return (
        <div className="mb-[3px] flex items-center gap-1">
          <span className="h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: `${tpl.accent}99` }} />
          <span className="h-[3.5px] rounded-full bg-slate-900/[0.17]" style={{ width: `${row.w}%` }} />
        </div>
      );
    case 'row':
      return (
        <div
          className="mb-[2px] flex gap-[2px] rounded-[2px] p-[2px]"
          style={{ background: `${tpl.accent}24` }}
        >
          {row.cols.map((c, i) => (
            <span key={i} className="h-[7px] rounded-[1px] bg-white" style={{ width: `${c}%` }} />
          ))}
        </div>
      );
  }
}
