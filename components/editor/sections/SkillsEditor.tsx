'use client';
import React from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
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

const TAGS_BOX =
  'min-h-[38px] flex flex-wrap gap-1.5 p-2 border border-gov-gray-200 rounded bg-white ' +
  'focus-within:border-gov-blue focus-within:ring-2 focus-within:ring-gov-blue/10 transition-all';

const TagList = ({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) => {
  const [input, setInput] = React.useState('');
  const add = () => {
    const t = input.trim();
    if (t && !items.includes(t)) onChange([...items, t]);
    setInput('');
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
  };

  return (
    <div className={TAGS_BOX}>
      {items.map((skill, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-gov-blue-light text-gov-blue rounded text-[11px] font-semibold">
          {skill}
          <button onClick={() => remove(i)} aria-label={`Remove ${skill}`} className="hover:text-gov-red transition-colors">
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
  );
};

const FixedField = ({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-gov-gray-600 uppercase tracking-[0.1em]">{label}</label>
    <TagList items={items} onChange={onChange} />
  </div>
);

/**
 * Skills.
 *
 * Which fields this shows follows which fields the resume actually renders
 * from. When the engine recovers the resume's own section headings —
 * "TOSCA Platform", "Cloud Datawarehouse" — those are what every template
 * prints, and they are what this edits, names included.
 *
 * This used to edit the twelve fixed buckets below no matter what. With
 * verbatim categories present, nothing typed into them ever reached the
 * preview or the exported file: the recruiter corrected a skill, watched the
 * document not change, and had no way to tell why. The fixed buckets are now
 * the fallback for a resume whose own headings were not recovered.
 */
const SkillsEditor: React.FC<Props> = ({ data, onChange }) => {
  const skills = data.skills ?? {};
  const categories = skills.categories ?? [];
  const usingCategories = categories.length > 0;

  const setSkills = (next: Skills) => onChange({ ...data, skills: next });

  const updateFixed = (key: keyof Skills, value: string[]) =>
    setSkills({ ...skills, [key]: value });

  const updateCategory = (index: number, patch: { name?: string; skills?: string[] }) =>
    setSkills({
      ...skills,
      categories: categories.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    });

  const removeCategory = (index: number) =>
    setSkills({ ...skills, categories: categories.filter((_, i) => i !== index) });

  const addCategory = () =>
    setSkills({ ...skills, categories: [...categories, { name: '', skills: [] }] });

  const totalCount = usingCategories
    ? categories.reduce((sum, c) => sum + (c?.skills?.length ?? 0), 0)
    : SKILL_FIELDS.reduce((sum, f) => sum + ((skills[f.key] as string[] | undefined)?.length ?? 0), 0);

  const groupCount = usingCategories ? categories.length : SKILL_FIELDS.length;

  return (
    <div>
      <div className="pb-3 mb-5 border-b border-gov-gray-200">
        <h3 className="text-sm font-extrabold text-gov-gray-900 uppercase tracking-wide">Skills</h3>
        <p className="text-xs text-gov-gray-400 mt-0.5">
          {totalCount} skill{totalCount !== 1 ? 's' : ''} across {groupCount}{' '}
          {usingCategories ? 'categories from the resume' : 'categories'} · Enter to add, × to remove
        </p>
      </div>

      {usingCategories ? (
        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  value={cat?.name ?? ''}
                  onChange={e => updateCategory(i, { name: e.target.value })}
                  placeholder="Category name"
                  aria-label={`Category ${i + 1} name`}
                  className="flex-1 text-[10px] font-bold text-gov-gray-600 uppercase tracking-[0.1em] bg-transparent border-b border-transparent hover:border-gov-gray-200 focus:border-gov-blue outline-none py-0.5"
                />
                <button
                  onClick={() => removeCategory(i)}
                  aria-label={`Remove ${cat?.name || 'category'}`}
                  className="text-gov-gray-400 hover:text-gov-red transition-colors"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
              <TagList items={cat?.skills ?? []} onChange={v => updateCategory(i, { skills: v })} />
            </div>
          ))}
          <button
            onClick={addCategory}
            className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-gov-blue border border-dashed border-gov-gray-300 rounded hover:border-gov-blue hover:bg-gov-blue-light/40 transition-colors"
          >
            <FiPlus size={12} /> Add category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {SKILL_FIELDS.map(({ key, label }) => (
            <FixedField
              key={key}
              label={label}
              items={(skills[key] as string[]) ?? []}
              onChange={v => updateFixed(key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsEditor;
