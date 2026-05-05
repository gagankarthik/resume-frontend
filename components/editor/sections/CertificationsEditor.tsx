'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { APIResponse, Certification } from '@/lib/types';

interface Props {
  data: APIResponse;
  onChange: (data: APIResponse) => void;
}

const empty = (): Certification => ({ name: '', issuing_organization: '', issue_date: '', expiry_date: '' });

const Field = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    <input value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
  </div>
);

const CertCard = ({ cert, index, onUpdate, onRemove }: {
  cert: Certification; index: number; onUpdate: (c: Certification) => void; onRemove: () => void;
}) => {
  const [open, setOpen] = useState(index === 0);
  const u = (p: Partial<Certification>) => onUpdate({ ...cert, ...p });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{cert.name || 'New Certification'}</p>
          <p className="text-xs text-gray-500">{cert.issuing_organization}</p>
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
          <Field label="Certification Name" value={cert.name} onChange={v => u({ name: v })} />
          <Field label="Issuing Organization" value={cert.issuing_organization} onChange={v => u({ issuing_organization: v })} />
          <Field label="Issue Date" value={cert.issue_date} onChange={v => u({ issue_date: v })} />
          <Field label="Expiry Date" value={cert.expiry_date} onChange={v => u({ expiry_date: v })} />
          <Field label="Credential ID" value={cert.credential_id} onChange={v => u({ credential_id: v })} />
          <Field label="Credential URL" value={cert.credential_url} onChange={v => u({ credential_url: v })} />
        </div>
      )}
    </div>
  );
};

const CertificationsEditor: React.FC<Props> = ({ data, onChange }) => {
  const list = data.certifications ?? [];
  const update = (i: number, c: Certification) => { const a = [...list]; a[i] = c; onChange({ ...data, certifications: a }); };
  const remove = (i: number) => onChange({ ...data, certifications: list.filter((_, idx) => idx !== i) });
  const add = () => onChange({ ...data, certifications: [empty(), ...list] });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-gray-800 text-base">Certifications</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold">
          <FiPlus size={13} /> Add
        </button>
      </div>
      {list.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No certifications yet</p>}
      {list.map((cert, i) => <CertCard key={i} cert={cert} index={i} onUpdate={c => update(i, c)} onRemove={() => remove(i)} />)}
    </div>
  );
};

export default CertificationsEditor;
