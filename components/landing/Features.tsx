import React from 'react';
import { FiCpu, FiLayers, FiEdit3, FiEye, FiDownload, FiLock, FiFile, FiZap } from 'react-icons/fi';

const features = [
  {
    Icon: FiCpu,
    title: 'AI Extraction',
    body: 'Advanced AI reads resumes of any complexity — multi-column, scanned, sidebar layouts — and extracts every detail accurately.',
    tag: 'AI Engine',
    color: 'blue',
  },
  {
    Icon: FiLayers,
    title: '20+ Structured Sections',
    body: 'Work history, education, skills, certifications, projects, publications, patents, memberships, and more — all in one pass.',
    tag: 'Comprehensive',
    color: 'blue',
  },
  {
    Icon: FiEdit3,
    title: 'Inline Field Editing',
    body: 'Edit every extracted entry directly in the browser. Add, modify, or remove items with structured form inputs and tag-based skill editors.',
    tag: 'Interactive',
    color: 'green',
  },
  {
    Icon: FiEye,
    title: 'Live Preview',
    body: 'The formatted resume updates in real time as you edit. Toggle between state formats instantly.',
    tag: 'Real-time',
    color: 'green',
  },
  {
    Icon: FiDownload,
    title: 'One-Click Export',
    body: 'Download a properly formatted Word document for any state. Print to PDF directly from your browser — no watermarks.',
    tag: 'DOCX Export',
    color: 'amber',
  },
  {
    Icon: FiZap,
    title: 'Split-View Editor',
    body: 'Work in a resizable split view with the field editor on the left and live preview on the right. Drag the divider to resize.',
    tag: 'Productivity',
    color: 'amber',
  },
  {
    Icon: FiFile,
    title: 'Any File Format',
    body: 'Accepts PDF, DOCX, DOC, and TXT files up to 20 MB. Handles scanned documents when OCR is enabled on the server.',
    tag: 'Flexible',
    color: 'blue',
  },
  {
    Icon: FiLock,
    title: 'Private by Default',
    body: 'Processed in-memory and stored only in your browser\'s local storage. Nothing is retained on the server after extraction.',
    tag: 'Privacy',
    color: 'green',
  },
];

const tagStyles: Record<string, string> = {
  blue:  'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
};

const iconBg: Record<string, string> = {
  blue:  'bg-blue-50 text-blue-500 group-hover:bg-gov-blue group-hover:text-white',
  green: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
  amber: 'bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
};

const Features: React.FC = () => (
  <section id="features" className="py-24 bg-gov-gray-50">
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="mb-14">
        <p className="text-gov-blue text-xs font-bold tracking-[0.2em] uppercase mb-3">Features</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gov-gray-900 mb-4">
          Everything you need to<br />process resumes faster
        </h2>
        <p className="text-gov-gray-500 max-w-xl leading-relaxed text-base">
          Built for recruiters and HR teams who handle state job applications.
        </p>
        <div className="mt-6 w-12 h-1 bg-gov-blue rounded-full" />
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ Icon, title, body, tag, color }, i) => (
          <div
            key={i}
            className="bg-white border border-gov-gray-100 rounded-xl p-5 hover:border-gov-blue/20 hover:shadow-md transition-all duration-200 group cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${iconBg[color]}`}>
                <Icon size={17} />
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${tagStyles[color]}`}>
                {tag}
              </span>
            </div>
            <h3 className="font-bold text-gov-gray-900 text-sm mb-2 leading-snug">{title}</h3>
            <p className="text-gov-gray-500 text-xs leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
