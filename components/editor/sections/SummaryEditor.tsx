'use client';

import React from 'react';
import type { APIResponse } from '@/lib/types';

interface Props {
  data: APIResponse;
  onChange: (data: APIResponse) => void;
}

const SummaryEditor: React.FC<Props> = ({ data, onChange }) => (
  <div className="space-y-4">
    <h3 className="font-bold text-gray-800 text-base border-b pb-2">Professional Summary</h3>
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Summary</label>
      <textarea
        rows={8}
        value={data.professional_summary ?? ''}
        onChange={e => onChange({ ...data, professional_summary: e.target.value })}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition resize-none leading-relaxed"
        placeholder="Enter a professional summary…"
      />
    </div>
    {data.objective !== undefined && (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Objective</label>
        <textarea
          rows={4}
          value={data.objective ?? ''}
          onChange={e => onChange({ ...data, objective: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition resize-none"
          placeholder="Career objective…"
        />
      </div>
    )}
  </div>
);

export default SummaryEditor;
