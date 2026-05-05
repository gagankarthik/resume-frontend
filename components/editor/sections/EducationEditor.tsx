'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { APIResponse, Education } from '@/lib/types';

interface Props {
  data: APIResponse;
  onChange: (data: APIResponse) => void;
}

const empty = (): Education => ({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', location: '' });

const Field = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    <input value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
  </div>
);

const EduCard = ({ edu, index, onUpdate, onRemove }: {
  edu: Education; index: number; onUpdate: (e: Education) => void; onRemove: () => void;
}) => {
  const [open, setOpen] = useState(index === 0);
  const u = (patch: Partial<Education>) => onUpdate({ ...edu, ...patch });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{edu.institution_name || 'New Education'}</p>
          <p className="text-xs text-gray-500">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onRemove(); }} className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50">
            <FiTrash2 size={14} />
          </button>
          {open ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Institution" value={edu.institution_name} onChange={v => u({ institution_name: v })} />
          <Field label="Degree" value={edu.degree} onChange={v => u({ degree: v })} />
          <Field label="Field of Study" value={edu.field_of_study} onChange={v => u({ field_of_study: v })} />
          <Field label="Major" value={edu.major} onChange={v => u({ major: v })} />
          <Field label="Start Date" value={edu.start_date} onChange={v => u({ start_date: v })} />
          <Field label="End Date" value={edu.end_date} onChange={v => u({ end_date: v })} />
          <Field label="GPA" value={edu.gpa ? String(edu.gpa) : ''} onChange={v => u({ gpa: parseFloat(v) || undefined })} />
          <Field label="Location" value={edu.location} onChange={v => u({ location: v })} />
          <Field label="Thesis / Dissertation" value={edu.thesis_title} onChange={v => u({ thesis_title: v })} />
        </div>
      )}
    </div>
  );
};

const EducationEditor: React.FC<Props> = ({ data, onChange }) => {
  const list = data.education ?? [];
  const update = (i: number, e: Education) => { const a = [...list]; a[i] = e; onChange({ ...data, education: a }); };
  const remove = (i: number) => onChange({ ...data, education: list.filter((_, idx) => idx !== i) });
  const add = () => onChange({ ...data, education: [empty(), ...list] });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-gray-800 text-base">Education</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold">
          <FiPlus size={13} /> Add
        </button>
      </div>
      {list.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No education entries yet</p>}
      {list.map((edu, i) => <EduCard key={i} edu={edu} index={i} onUpdate={e => update(i, e)} onRemove={() => remove(i)} />)}
    </div>
  );
};

export default EducationEditor;
