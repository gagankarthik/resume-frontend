'use client';
import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { APIResponse, WorkExperience } from '@/lib/types';

interface Props { data: APIResponse; onChange: (data: APIResponse) => void; }

const emptyJob = (): WorkExperience => ({
  company_name: '', job_title: '', start_date: '', end_date: '',
  location: '', responsibilities: [], technologies_used: [], description: '',
});

const Field = ({ label, value, onChange, multiline = false, span = false }: {
  label: string; value?: string; onChange: (v: string) => void; multiline?: boolean; span?: boolean;
}) => (
  <div className={`flex flex-col gap-1 ${span ? 'sm:col-span-2' : ''}`}>
    <label className="text-[10px] font-bold text-gov-gray-600 uppercase tracking-[0.1em]">{label}</label>
    {multiline
      ? <textarea rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} className="gov-input resize-none" />
      : <input value={value ?? ''} onChange={e => onChange(e.target.value)} className="gov-input" />
    }
  </div>
);

const ListEditor = ({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) => {
  const update = (i: number, val: string) => { const a = [...items]; a[i] = val; onChange(a); };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="sm:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-bold text-gov-gray-600 uppercase tracking-[0.1em]">{label}</label>
        <button onClick={() => onChange([...items, ''])}
          className="flex items-center gap-1 text-gov-blue hover:text-gov-blue-mid text-xs font-bold transition-colors">
          <FiPlus size={11} /> Add Entry
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input value={item} onChange={e => update(i, e.target.value)}
              className="gov-input flex-1 text-xs" placeholder={`${label} item ${i + 1}`} />
            <button onClick={() => remove(i)} className="p-2 text-gov-gray-400 hover:text-gov-red hover:bg-red-50 rounded transition-colors">
              <FiTrash2 size={13} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[11px] text-gov-gray-400 italic py-1">No entries — click &quot;Add Entry&quot; above</p>
        )}
      </div>
    </div>
  );
};

const JobCard = ({ job, index, onUpdate, onRemove }: {
  job: WorkExperience; index: number; onUpdate: (j: WorkExperience) => void; onRemove: () => void;
}) => {
  const [open, setOpen] = useState(index === 0);
  const u = (p: Partial<WorkExperience>) => onUpdate({ ...job, ...p });

  return (
    <div className="border border-gov-gray-200 rounded overflow-hidden">
      {/* Accordion header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
          open ? 'bg-gov-blue-bg border-b border-gov-gray-200' : 'bg-gov-gray-50 hover:bg-gov-gray-100'
        }`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2 h-8 rounded-full flex-shrink-0 ${open ? 'bg-gov-blue' : 'bg-gov-gray-300'}`} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gov-gray-900 truncate">{job.company_name || 'New Position'}</p>
            <p className="text-xs text-gov-gray-500">{job.job_title || 'Role'}{job.start_date ? ` · ${job.start_date}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button onClick={e => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 text-gov-gray-400 hover:text-gov-red hover:bg-red-50 rounded transition-colors">
            <FiTrash2 size={13} />
          </button>
          {open ? <FiChevronUp size={15} className="text-gov-gray-400" /> : <FiChevronDown size={15} className="text-gov-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Company Name" value={job.company_name} onChange={v => u({ company_name: v })} />
          <Field label="Job Title / Role" value={job.job_title} onChange={v => u({ job_title: v })} />
          <Field label="Start Date" value={job.start_date} onChange={v => u({ start_date: v })} />
          <Field label="End Date (or 'Present')" value={job.end_date} onChange={v => u({ end_date: v })} />
          <Field label="Location" value={job.location} onChange={v => u({ location: v })} />
          <Field label="Department" value={job.department} onChange={v => u({ department: v })} />
          <Field label="Employment Type" value={job.employment_type} onChange={v => u({ employment_type: v })} />
          <Field label="Duration" value={job.duration} onChange={v => u({ duration: v })} />
          <Field label="Description" value={job.description} onChange={v => u({ description: v })} multiline span />
          <ListEditor label="Responsibilities" items={job.responsibilities ?? []} onChange={v => u({ responsibilities: v })} />
          <ListEditor label="Key Technologies" items={job.technologies_used ?? []} onChange={v => u({ technologies_used: v })} />
          <ListEditor label="Achievements" items={job.achievements ?? []} onChange={v => u({ achievements: v })} />
        </div>
      )}
    </div>
  );
};

const WorkExperienceEditor: React.FC<Props> = ({ data, onChange }) => {
  const jobs = data.work_experience ?? [];
  const update = (i: number, j: WorkExperience) => { const a = [...jobs]; a[i] = j; onChange({ ...data, work_experience: a }); };
  const remove = (i: number) => onChange({ ...data, work_experience: jobs.filter((_, idx) => idx !== i) });
  const add = () => onChange({ ...data, work_experience: [emptyJob(), ...jobs] });

  return (
    <div>
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-gov-gray-200">
        <div>
          <h3 className="text-sm font-extrabold text-gov-gray-900 uppercase tracking-wide">Work Experience</h3>
          <p className="text-xs text-gov-gray-400 mt-0.5">{jobs.length} position{jobs.length !== 1 ? 's' : ''} extracted</p>
        </div>
        <button onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gov-blue hover:bg-gov-blue-mid text-white rounded text-xs font-bold transition-colors">
          <FiPlus size={12} /> Add Position
        </button>
      </div>
      {jobs.length === 0 && <p className="text-sm text-gov-gray-400 italic text-center py-8">No work experience entries yet</p>}
      <div className="space-y-3">
        {jobs.map((job, i) => (
          <JobCard key={i} job={job} index={i} onUpdate={j => update(i, j)} onRemove={() => remove(i)} />
        ))}
      </div>
    </div>
  );
};

export default WorkExperienceEditor;
