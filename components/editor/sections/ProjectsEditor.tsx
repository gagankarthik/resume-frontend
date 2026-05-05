'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import type { APIResponse, Project } from '@/lib/types';

interface Props {
  data: APIResponse;
  onChange: (data: APIResponse) => void;
}

const empty = (): Project => ({ name: '', description: '', role: '', start_date: '', end_date: '', technologies: [], highlights: [] });

const Field = ({ label, value, onChange, multiline = false }: { label: string; value?: string; onChange: (v: string) => void; multiline?: boolean }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    {multiline
      ? <textarea rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none" />
      : <input value={value ?? ''} onChange={e => onChange(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />}
  </div>
);

const TagList = ({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) => {
  const [val, setVal] = React.useState('');
  const add = () => { if (val.trim()) { onChange([...items, val.trim()]); setVal(''); } };
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg bg-white min-h-[38px]">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
            {t}<button onClick={() => onChange(items.filter((_, j) => j !== i))}><FiX size={10} /></button>
          </span>
        ))}
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          onBlur={add} placeholder="Add…" className="flex-1 min-w-[80px] outline-none text-xs bg-transparent" />
      </div>
    </div>
  );
};

const ProjCard = ({ proj, index, onUpdate, onRemove }: {
  proj: Project; index: number; onUpdate: (p: Project) => void; onRemove: () => void;
}) => {
  const [open, setOpen] = useState(index === 0);
  const u = (patch: Partial<Project>) => onUpdate({ ...proj, ...patch });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{proj.name || 'New Project'}</p>
          <p className="text-xs text-gray-500">{proj.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onRemove(); }} className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50"><FiTrash2 size={14} /></button>
          {open ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Project Name" value={proj.name} onChange={v => u({ name: v })} />
            <Field label="Role" value={proj.role} onChange={v => u({ role: v })} />
            <Field label="Start Date" value={proj.start_date} onChange={v => u({ start_date: v })} />
            <Field label="End Date" value={proj.end_date} onChange={v => u({ end_date: v })} />
            <Field label="URL" value={proj.url} onChange={v => u({ url: v })} />
            <Field label="Repository URL" value={proj.repository_url} onChange={v => u({ repository_url: v })} />
          </div>
          <Field label="Description" value={proj.description} onChange={v => u({ description: v })} multiline />
          <TagList label="Technologies" items={proj.technologies ?? []} onChange={v => u({ technologies: v })} />
          <TagList label="Highlights" items={proj.highlights ?? []} onChange={v => u({ highlights: v })} />
        </div>
      )}
    </div>
  );
};

const ProjectsEditor: React.FC<Props> = ({ data, onChange }) => {
  const list = data.projects ?? [];
  const update = (i: number, p: Project) => { const a = [...list]; a[i] = p; onChange({ ...data, projects: a }); };
  const remove = (i: number) => onChange({ ...data, projects: list.filter((_, idx) => idx !== i) });
  const add = () => onChange({ ...data, projects: [empty(), ...list] });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-gray-800 text-base">Projects</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"><FiPlus size={13} /> Add</button>
      </div>
      {list.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No projects yet</p>}
      {list.map((p, i) => <ProjCard key={i} proj={p} index={i} onUpdate={p => update(i, p)} onRemove={() => remove(i)} />)}
    </div>
  );
};

export default ProjectsEditor;
