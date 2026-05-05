import React from 'react';
import Link from 'next/link';

const sections = {
  ohio: [
    'Name, Title & Requisition Number',
    'Education (structured table)',
    'Certifications & Licenses',
    'Employment History with periods',
    'Professional Summary',
    'Technical Skills by category',
  ],
  pa: [
    'Professional Summary (first)',
    'Employment History with periods',
    'Education (structured table)',
    'Certifications & Licenses',
    'Technical Skills by category',
    'Additional sections as needed',
  ],
};

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-gov-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 12 12">
    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z"/>
  </svg>
);

const StateCard = ({
  abbr, state, color, sectionList, note,
}: {
  abbr: string; state: string; color: string;
  sectionList: string[]; note: string;
}) => (
  <div className="flex-1 bg-white border border-gov-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
    <div className={`${color} px-6 py-6 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/20 to-transparent" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs font-bold tracking-[0.15em] uppercase mb-1">Export Format</p>
          <h3 className="text-white text-2xl font-extrabold">{state}</h3>
        </div>
        <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-white text-xl font-black">{abbr}</span>
        </div>
      </div>
    </div>

    <div className="px-6 py-5">
      <p className="text-[10px] font-bold text-gov-gray-400 uppercase tracking-widest mb-3">Included Sections</p>
      <ul className="space-y-2 mb-5">
        {sectionList.map(s => (
          <li key={s} className="flex items-start gap-2.5 text-sm text-gov-gray-700">
            <CheckIcon />
            {s}
          </li>
        ))}
      </ul>
      <div className="flex items-start gap-2 py-3 px-3.5 bg-gov-gray-50 rounded-lg border border-gov-gray-100">
        <svg className="w-4 h-4 text-gov-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
        <p className="text-xs text-gov-gray-600 leading-relaxed">{note}</p>
      </div>
    </div>
  </div>
);

const StateFormats: React.FC = () => (
  <section id="formats" className="py-24 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="mb-12">
        <p className="text-gov-blue text-xs font-bold tracking-[0.2em] uppercase mb-3">Export Formats</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gov-gray-900 mb-4">
          State formats,<br />ready to submit
        </h2>
        <p className="text-gov-gray-500 max-w-xl leading-relaxed text-base">
          Download a properly formatted Word document for state job applications — one click, zero reformatting.
        </p>
        <div className="mt-6 w-12 h-1 bg-gov-blue rounded-full" />
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <StateCard
          abbr="OH"
          state="Ohio"
          color="bg-gov-navy"
          sectionList={sections.ohio}
          note="Includes VectorVMS Requisition Number field and formats employment with work periods and key technologies per Ohio HR standard."
        />
        <StateCard
          abbr="PA"
          state="Pennsylvania"
          color="bg-pa-dark"
          sectionList={sections.pa}
          note="Commonwealth layout with summary leading, structured employment blocks, and credential sections per PA OA/OHR format."
        />
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gov-blue hover:bg-gov-blue-mid text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload and Choose Your Format
        </Link>
        <p className="text-gov-gray-400 text-xs mt-3">No account required · Processes in under 30 seconds</p>
      </div>
    </div>
  </section>
);

export default StateFormats;
