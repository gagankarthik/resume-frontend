'use client';
import React from 'react';
import type { APIResponse, PersonalInformation } from '@/lib/types';

interface Props { data: APIResponse; onChange: (data: APIResponse) => void; }

const Field = ({ label, value, onChange, type = 'text', hint }: {
  label: string; value?: string; onChange: (v: string) => void; type?: string; hint?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-gov-gray-600 uppercase tracking-[0.1em]">{label}</label>
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="gov-input" />
    {hint && <p className="text-[10px] text-gov-gray-400">{hint}</p>}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mt-5 mb-3">
    <p className="text-[10px] font-black text-gov-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">{children}</p>
    <div className="flex-1 h-px bg-gov-gray-200" />
  </div>
);

const PersonalInfoEditor: React.FC<Props> = ({ data, onChange }) => {
  const pi = data.personal_information ?? {};
  const update = (patch: Partial<PersonalInformation>) =>
    onChange({ ...data, personal_information: { ...pi, ...patch } });
  const updateAddress = (field: string, val: string) =>
    update({ address: { ...(pi.address ?? {}), [field]: val } });

  return (
    <div>
      <div className="pb-3 mb-5 border-b border-gov-gray-200">
        <h3 className="text-sm font-extrabold text-gov-gray-900 uppercase tracking-wide">Personal Information</h3>
        <p className="text-xs text-gov-gray-400 mt-0.5">Core identity fields as extracted from the resume</p>
      </div>

      <SectionLabel>Application</SectionLabel>
      <div className="grid grid-cols-1 gap-3">
        <Field label="Requisition Number" value={pi.requisition_number}
          onChange={v => update({ requisition_number: v })}
          hint="VectorVMS / PeopleFluent requisition number for the job posting" />
      </div>

      <SectionLabel>Name</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Full Name" value={pi.full_name} onChange={v => update({ full_name: v })} />
        <Field label="Profile Headline / Title" value={pi.profile_headline} onChange={v => update({ profile_headline: v })} />
        <Field label="First Name" value={pi.first_name} onChange={v => update({ first_name: v })} />
        <Field label="Last Name" value={pi.last_name} onChange={v => update({ last_name: v })} />
      </div>

      <SectionLabel>Contact</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Email Address" value={pi.email?.[0]} type="email"
          onChange={v => update({ email: [v, ...(pi.email ?? []).slice(1)] })} />
        <Field label="Phone Number" value={pi.phone?.[0]}
          onChange={v => update({ phone: [v, ...(pi.phone ?? []).slice(1)] })} />
        <Field label="LinkedIn URL" value={pi.linkedin_url} onChange={v => update({ linkedin_url: v })} />
        <Field label="GitHub URL" value={pi.github_url} onChange={v => update({ github_url: v })} />
        <Field label="Portfolio URL" value={pi.portfolio_url} onChange={v => update({ portfolio_url: v })} />
        <Field label="Nationality" value={pi.nationality} onChange={v => update({ nationality: v })} />
      </div>

      <SectionLabel>Address</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Street Address" value={pi.address?.street} onChange={v => updateAddress('street', v)} />
        </div>
        <Field label="City" value={pi.address?.city} onChange={v => updateAddress('city', v)} />
        <Field label="State / Province" value={pi.address?.state} onChange={v => updateAddress('state', v)} />
        <Field label="ZIP / Postal Code" value={pi.address?.zip_code} onChange={v => updateAddress('zip_code', v)} />
        <Field label="Country" value={pi.address?.country} onChange={v => updateAddress('country', v)} />
      </div>
    </div>
  );
};

export default PersonalInfoEditor;
