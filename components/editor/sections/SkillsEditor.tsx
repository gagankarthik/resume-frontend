'use client';
import React from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import type { APIResponse, Skills } from '@/lib/types';

interface Props { data: APIResponse; onChange: (data: APIResponse) => void; }

const SKILL_FIELDS: { key: keyof Skills; label: string }[] = [
  { key: 'programming_languages',    label: 'Programming Languages' },
  { key: 'frameworks_and_libraries', label: 'Frameworks & Libraries' },
  { key: 'databases',                label: 'Databases' },
  { key: 'cloud_platforms',          label: 'Cloud Platforms' },
  { key: 'tools_and_platforms',      label: 'Tools & Platforms' },
  { key: 'technical_skills',         label: 'Technical Skills' },
  { key: 'operating_systems',        label: 'Operating Systems' },
  { key: 'methodologies',            label: 'Methodologies' },
  { key: 'domain_skills',            label: 'Domain Skills' },
  { key: 'design_skills',            label: 'Design Skills' },
  { key: 'soft_skills',              label: 'Soft Skills' },
  { key: 'other_skills',             label: 'Other Skills' },
];

const TagInput = ({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) => {
  const [input, setInput] = React.useState('');
  const add = () => {
    const t = input.trim();
    if (t && !items.includes(t)) onChange([...items, t]);
    setInput('');
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-gov-gray-600 uppercase tracking-[0.1em]">{label}</label>
      <div className="min-h-[38px] flex flex-wrap gap-1.5 p-2 border border-gov-gray-200 rounded bg-white focus-within:border-gov-blue focus-within:ring-2 focus-within:ring-gov-blue/10 transition-all">
        {items.map((skill, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-gov-blue-light text-gov-blue rounded text-[11px] font-semibold">
            {skill}
            <button onClick={() => remove(i)} className="hover:text-gov-red transition-colors">
              <FiX size={10} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={items.length === 0 ? 'Type skill, press Enter…' : 'Add more…'}
          className="flex-1 min-w-[100px] outline-none text-xs text-gov-gray-700 bg-transparent placeholder:text-gov-gray-400"
        />
      </div>
    </div>
  );
};

const SkillsEditor: React.FC<Props> = ({ data, onChange }) => {
  const skills = data.skills ?? {};
  const update = (key: keyof Skills, value: string[]) =>
    onChange({ ...data, skills: { ...skills, [key]: value } });

  const totalCount = SKILL_FIELDS.reduce((sum, f) => sum + ((skills[f.key] as string[] | undefined)?.length ?? 0), 0);

  return (
    <div>
      <div className="pb-3 mb-5 border-b border-gov-gray-200">
        <h3 className="text-sm font-extrabold text-gov-gray-900 uppercase tracking-wide">Skills</h3>
        <p className="text-xs text-gov-gray-400 mt-0.5">{totalCount} skill{totalCount !== 1 ? 's' : ''} across {SKILL_FIELDS.length} categories · Enter to add, × to remove</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {SKILL_FIELDS.map(({ key, label }) => (
          <TagInput
            key={key}
            label={label}
            items={(skills[key] as string[]) ?? []}
            onChange={v => update(key, v)}
          />
        ))}
      </div>
    </div>
  );
};

export default SkillsEditor;
