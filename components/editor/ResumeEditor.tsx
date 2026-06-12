'use client';

import React, { useState } from 'react';
import type { APIResponse } from '@/lib/types';
import PersonalInfoEditor from './sections/PersonalInfoEditor';
import SummaryEditor from './sections/SummaryEditor';
import WorkExperienceEditor from './sections/WorkExperienceEditor';
import EducationEditor from './sections/EducationEditor';
import SkillsEditor from './sections/SkillsEditor';
import CertificationsEditor from './sections/CertificationsEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import MoreSectionsEditor from './sections/MoreSectionsEditor';
import { FiUser, FiFileText, FiBriefcase, FiBook, FiZap, FiAward, FiCode, FiMoreHorizontal } from 'react-icons/fi';

interface Props {
  data: APIResponse;
  onChange: (data: APIResponse) => void;
}

type SectionId = 'personal' | 'summary' | 'work' | 'education' | 'skills' | 'certifications' | 'projects' | 'more';

const SECTIONS: { id: SectionId; label: string; Icon: React.FC<{ size?: number }>; count?: (d: APIResponse) => number }[] = [
  { id: 'personal',       label: 'Personal Info',    Icon: FiUser },
  { id: 'summary',        label: 'Summary',          Icon: FiFileText },
  { id: 'work',           label: 'Work Experience',  Icon: FiBriefcase,    count: d => d.work_experience?.length ?? 0 },
  { id: 'education',      label: 'Education',        Icon: FiBook,         count: d => d.education?.length ?? 0 },
  { id: 'skills',         label: 'Skills',           Icon: FiZap },
  { id: 'certifications', label: 'Certifications',   Icon: FiAward,        count: d => d.certifications?.length ?? 0 },
  { id: 'projects',       label: 'Projects',         Icon: FiCode,         count: d => d.projects?.length ?? 0 },
  { id: 'more',           label: 'More Sections',    Icon: FiMoreHorizontal },
];

// Banner summarising the backend's extraction-quality audit. Only shows when
// there is something actionable: coverage gaps or removed/suspect values.
const AuditBanner: React.FC<{ data: APIResponse }> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const audit = data._metadata?.audit;
  if (!audit) return null;

  const coverage = audit.coverage_percent;
  const warnings = audit.warnings ?? [];
  const missed = audit.missed_lines ?? [];
  const hasIssues = (coverage !== undefined && coverage < 95) || warnings.length > 0 || missed.length > 0;
  if (!hasIssues) return null;

  return (
    <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-2 text-left font-bold">
        <span>⚠</span>
        <span className="flex-1">
          Extraction check{coverage !== undefined ? ` — ${coverage}% of the resume captured` : ''}
          {warnings.length > 0 ? ` · ${warnings.length} warning${warnings.length > 1 ? 's' : ''}` : ''}
        </span>
        <span className="font-normal underline">{open ? 'hide' : 'details'}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {warnings.map((w, i) => <p key={`w${i}`}>• {w}</p>)}
          {missed.length > 0 && (
            <>
              <p className="font-bold mt-1">Lines that may not have been captured:</p>
              {missed.map((m, i) => <p key={`m${i}`} className="truncate">– {m}</p>)}
            </>
          )}
          <p className="mt-1 text-amber-700">Review the affected sections and fill in anything missing before downloading.</p>
        </div>
      )}
    </div>
  );
};

const ResumeEditor: React.FC<Props> = ({ data, onChange }) => {
  const [active, setActive] = useState<SectionId>('personal');

  const renderSection = () => {
    switch (active) {
      case 'personal':       return <PersonalInfoEditor data={data} onChange={onChange} />;
      case 'summary':        return <SummaryEditor data={data} onChange={onChange} />;
      case 'work':           return <WorkExperienceEditor data={data} onChange={onChange} />;
      case 'education':      return <EducationEditor data={data} onChange={onChange} />;
      case 'skills':         return <SkillsEditor data={data} onChange={onChange} />;
      case 'certifications': return <CertificationsEditor data={data} onChange={onChange} />;
      case 'projects':       return <ProjectsEditor data={data} onChange={onChange} />;
      case 'more':           return <MoreSectionsEditor data={data} onChange={onChange} />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <nav className="w-36 flex-shrink-0 border-r border-gov-gray-200 bg-gov-gray-50 py-2 overflow-y-auto">
        <p className="px-3 pt-2 pb-1 text-[9px] font-black text-gov-gray-400 uppercase tracking-[0.15em]">Sections</p>
        {SECTIONS.map(s => {
          const cnt = s.count?.(data);
          const Icon = s.Icon;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-all border-l-2 ${
                active === s.id
                  ? 'border-gov-blue bg-gov-blue-light text-gov-blue font-bold'
                  : 'border-transparent text-gov-gray-600 hover:bg-gov-gray-100 hover:text-gov-gray-900 font-medium'
              }`}
            >
              <Icon size={13} />
              <span className="flex-1 leading-tight">{s.label}</span>
              {cnt !== undefined && cnt > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  active === s.id ? 'bg-gov-blue text-white' : 'bg-gov-gray-200 text-gov-gray-600'
                }`}>{cnt}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto p-5 bg-white">
        <AuditBanner data={data} />
        {renderSection()}
      </div>
    </div>
  );
};

export default ResumeEditor;
