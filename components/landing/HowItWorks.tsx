import React from 'react';
import { FiUploadCloud, FiCpu, FiEdit3, FiDownload } from 'react-icons/fi';

const steps = [
  {
    num: '01',
    Icon: FiUploadCloud,
    title: 'Upload Any Resume',
    body: 'Drop in a PDF, DOCX, DOC, or TXT file up to 20 MB. Works with single-column, multi-column, and even scanned documents.',
    note: 'PDF · DOCX · DOC · TXT',
    accent: '#005ea2',
  },
  {
    num: '02',
    Icon: FiCpu,
    title: 'AI Extracts Every Field',
    body: 'Our AI reads the full document and pulls 20+ structured fields — employment history, education, skills, certifications, projects, and more.',
    note: 'Powered by AI · ~10–30 sec',
    accent: '#1a6bbd',
  },
  {
    num: '03',
    Icon: FiEdit3,
    title: 'Review &amp; Edit',
    body: 'Open the split-view editor to verify each field. Add, modify, or remove any entry with structured inputs and tag-based skill editors.',
    note: 'Auto-saved to local storage',
    accent: '#2a7ece',
  },
  {
    num: '04',
    Icon: FiDownload,
    title: 'Download Formatted',
    body: 'Choose a state format and download a ready-to-submit Word document. Print to PDF from any browser.',
    note: 'State Formats · DOCX',
    accent: '#0d2240',
  },
];

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="py-24 bg-gov-gray-50">
    <div className="max-w-6xl mx-auto px-6">

      {/* Header */}
      <div className="mb-16">
        <p className="text-gov-blue text-xs font-bold tracking-[0.2em] uppercase mb-3">Workflow</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gov-gray-900 mb-4">
          From upload to formatted<br />document in four steps
        </h2>
        <p className="text-gov-gray-500 max-w-lg leading-relaxed text-base">
          No manual data entry. No reformatting. Just upload, review, and download.
        </p>
        <div className="mt-6 w-12 h-1 bg-gov-blue rounded-full" />
      </div>

      {/* Steps */}
      <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Connector track */}
        <div className="hidden lg:block absolute top-10 left-[calc(12.5%+36px)] right-[calc(12.5%+36px)] h-px bg-gov-gray-200 z-0" />

        {steps.map((step, i) => {
          const Icon = step.Icon;
          return (
            <div key={i} className="relative z-10 flex flex-col lg:items-center lg:text-center px-4 pb-10 lg:pb-0">
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-5 flex-shrink-0"
                style={{ backgroundColor: step.accent }}
              >
                <Icon size={26} color="white" />
              </div>
              <span className="hidden lg:block text-[10px] font-black tracking-[0.2em] text-gov-gray-300 mb-2 uppercase">{step.num}</span>
              <h3 className="text-base font-bold text-gov-gray-900 mb-2">{step.title}</h3>
              <p className="text-gov-gray-500 text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: step.body }} />
              <span className="inline-block px-2.5 py-1 bg-gov-blue/8 text-gov-blue text-[10px] font-bold tracking-wide rounded-full">
                {step.note}
              </span>

              {/* Mobile connector */}
              {i < steps.length - 1 && (
                <div className="lg:hidden w-px h-6 bg-gov-gray-200 mx-auto mt-6" />
              )}
            </div>
          );
        })}
      </div>

      {/* Privacy note */}
      <div className="mt-16 flex items-start gap-3 px-5 py-4 bg-white border border-gov-gray-100 rounded-xl shadow-sm">
        <span className="text-gov-blue mt-0.5 flex-shrink-0">🔒</span>
        <p className="text-gov-gray-600 text-sm leading-relaxed">
          <strong className="text-gov-gray-900">Your data stays private.</strong>{' '}
          Resume data is stored only in your browser&apos;s local storage after extraction — nothing is retained server-side.
        </p>
      </div>
    </div>
  </section>
);

export default HowItWorks;
