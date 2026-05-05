'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import type { APIResponse } from '@/lib/types';

interface Props {
  data: APIResponse;
  onChange: (data: APIResponse) => void;
}

type SubTab = 'awards' | 'volunteer' | 'languages' | 'publications' | 'memberships' | 'interests';

const Field = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    <input value={value ?? ''} onChange={e => onChange(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
  </div>
);

const MoreSectionsEditor: React.FC<Props> = ({ data, onChange }) => {
  const [tab, setTab] = useState<SubTab>('awards');

  const tabs: { id: SubTab; label: string }[] = [
    { id: 'awards', label: 'Awards' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'languages', label: 'Languages' },
    { id: 'publications', label: 'Publications' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'interests', label: 'Interests' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-800 text-base border-b pb-2">Additional Sections</h3>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Awards */}
      {tab === 'awards' && (
        <div className="space-y-3">
          {(data.awards_and_honors ?? []).map((a, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
              <button onClick={() => onChange({ ...data, awards_and_honors: data.awards_and_honors!.filter((_, j) => j !== i) })} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
              <Field label="Award Title" value={a.title} onChange={v => { const arr = [...(data.awards_and_honors ?? [])]; arr[i] = { ...a, title: v }; onChange({ ...data, awards_and_honors: arr }); }} />
              <Field label="Issuer" value={a.issuer} onChange={v => { const arr = [...(data.awards_and_honors ?? [])]; arr[i] = { ...a, issuer: v }; onChange({ ...data, awards_and_honors: arr }); }} />
              <Field label="Date" value={a.date} onChange={v => { const arr = [...(data.awards_and_honors ?? [])]; arr[i] = { ...a, date: v }; onChange({ ...data, awards_and_honors: arr }); }} />
            </div>
          ))}
          <button onClick={() => onChange({ ...data, awards_and_honors: [...(data.awards_and_honors ?? []), { title: '', issuer: '', date: '' }] })} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"><FiPlus size={14} /> Add Award</button>
        </div>
      )}

      {/* Volunteer */}
      {tab === 'volunteer' && (
        <div className="space-y-3">
          {(data.volunteer_experience ?? []).map((v, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
              <button onClick={() => onChange({ ...data, volunteer_experience: data.volunteer_experience!.filter((_, j) => j !== i) })} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
              <Field label="Organization" value={v.organization} onChange={val => { const arr = [...(data.volunteer_experience ?? [])]; arr[i] = { ...v, organization: val }; onChange({ ...data, volunteer_experience: arr }); }} />
              <Field label="Role" value={v.role} onChange={val => { const arr = [...(data.volunteer_experience ?? [])]; arr[i] = { ...v, role: val }; onChange({ ...data, volunteer_experience: arr }); }} />
              <Field label="Start Date" value={v.start_date} onChange={val => { const arr = [...(data.volunteer_experience ?? [])]; arr[i] = { ...v, start_date: val }; onChange({ ...data, volunteer_experience: arr }); }} />
              <Field label="End Date" value={v.end_date} onChange={val => { const arr = [...(data.volunteer_experience ?? [])]; arr[i] = { ...v, end_date: val }; onChange({ ...data, volunteer_experience: arr }); }} />
            </div>
          ))}
          <button onClick={() => onChange({ ...data, volunteer_experience: [...(data.volunteer_experience ?? []), { organization: '', role: '' }] })} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"><FiPlus size={14} /> Add Volunteer Entry</button>
        </div>
      )}

      {/* Languages */}
      {tab === 'languages' && (
        <div className="space-y-3">
          {(data.languages ?? []).map((l, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
              <button onClick={() => onChange({ ...data, languages: data.languages!.filter((_, j) => j !== i) })} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
              <Field label="Language" value={l.language} onChange={v => { const arr = [...(data.languages ?? [])]; arr[i] = { ...l, language: v }; onChange({ ...data, languages: arr }); }} />
              <Field label="Proficiency" value={l.proficiency} onChange={v => { const arr = [...(data.languages ?? [])]; arr[i] = { ...l, proficiency: v }; onChange({ ...data, languages: arr }); }} />
            </div>
          ))}
          <button onClick={() => onChange({ ...data, languages: [...(data.languages ?? []), { language: '', proficiency: '' }] })} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"><FiPlus size={14} /> Add Language</button>
        </div>
      )}

      {/* Publications */}
      {tab === 'publications' && (
        <div className="space-y-3">
          {(data.publications ?? []).map((p, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
              <button onClick={() => onChange({ ...data, publications: data.publications!.filter((_, j) => j !== i) })} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
              <div className="sm:col-span-2"><Field label="Title" value={p.title} onChange={v => { const arr = [...(data.publications ?? [])]; arr[i] = { ...p, title: v }; onChange({ ...data, publications: arr }); }} /></div>
              <Field label="Publisher" value={p.publisher} onChange={v => { const arr = [...(data.publications ?? [])]; arr[i] = { ...p, publisher: v }; onChange({ ...data, publications: arr }); }} />
              <Field label="Date" value={p.date} onChange={v => { const arr = [...(data.publications ?? [])]; arr[i] = { ...p, date: v }; onChange({ ...data, publications: arr }); }} />
            </div>
          ))}
          <button onClick={() => onChange({ ...data, publications: [...(data.publications ?? []), { title: '', publisher: '' }] })} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"><FiPlus size={14} /> Add Publication</button>
        </div>
      )}

      {/* Memberships */}
      {tab === 'memberships' && (
        <div className="space-y-3">
          {(data.professional_memberships ?? []).map((m, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
              <button onClick={() => onChange({ ...data, professional_memberships: data.professional_memberships!.filter((_, j) => j !== i) })} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
              <Field label="Organization" value={m.organization} onChange={v => { const arr = [...(data.professional_memberships ?? [])]; arr[i] = { ...m, organization: v }; onChange({ ...data, professional_memberships: arr }); }} />
              <Field label="Role" value={m.role} onChange={v => { const arr = [...(data.professional_memberships ?? [])]; arr[i] = { ...m, role: v }; onChange({ ...data, professional_memberships: arr }); }} />
            </div>
          ))}
          <button onClick={() => onChange({ ...data, professional_memberships: [...(data.professional_memberships ?? []), { organization: '', role: '' }] })} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"><FiPlus size={14} /> Add Membership</button>
        </div>
      )}

      {/* Interests */}
      {tab === 'interests' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Comma-separated list of hobbies and interests</p>
          <textarea
            rows={4}
            value={(data.interests_and_hobbies ?? []).join(', ')}
            onChange={e => onChange({ ...data, interests_and_hobbies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
            placeholder="Reading, Hiking, Open Source…"
          />
        </div>
      )}
    </div>
  );
};

export default MoreSectionsEditor;
