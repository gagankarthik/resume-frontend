'use client';

import React, { useState } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet, normalizeMonthAbbr, splitProseToBullets,
  sortEducation, formatEmploymentLocation, getEducationCountry,
} from '@/formatters/shared/utils';
import StateDownloadDialog from './StateDownloadDialog';

interface Props {
  resumeData: ResumeData;
  previewMode?: boolean;
}

type SkillRow = { area: string; skills: string };

const collectSkillRows = (data: ResumeData): SkillRow[] => {
  const rows: SkillRow[] = [];
  (data.skillCategories ?? []).forEach(c => {
    const list = Array.isArray(c.skills) ? c.skills.filter(s => s?.trim()) : [];
    if (list.length) rows.push({ area: c.categoryName ?? 'Skills', skills: list.join(', ') });
  });
  if (data.technicalSkills) {
    Object.entries(data.technicalSkills).forEach(([k, v]) => {
      const list = Array.isArray(v) ? v.filter(s => s?.trim()).join(', ') : (typeof v === 'string' ? v : '');
      if (list) rows.push({ area: k, skills: list });
    });
  }
  return rows;
};

const GeorgiaFormat = React.forwardRef<HTMLDivElement, Props>(
  ({ resumeData, previewMode = false }, _ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const sortedEdu = sortEducation(resumeData.education ?? []);
    const skillRows = collectSkillRows(resumeData);

    return (
      <>
        <StateDownloadDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          resumeData={resumeData}
          defaultFormat="georgia"
        />

        <div className={previewMode ? 'flex flex-col h-full' : 'max-w-4xl mx-auto'}>

          {/* Action bar */}
          <div className={`sticky top-0 z-10 border-b border-gray-200 shadow-sm ${
            previewMode ? 'bg-ga-red px-5 py-3' : 'bg-white px-6 py-4'
          }`}>
            {previewMode ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-sm font-semibold tracking-wide">Georgia Format</span>
                  <span className="text-white/70 text-xs">— updates as you edit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all border border-white/20"
                  >
                    <FiPrinter className="mr-1.5" /> Print
                  </button>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="flex items-center px-3 py-1.5 bg-white text-ga-red hover:bg-ga-cream rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <FiDownload className="mr-1.5" /> Export
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold text-ga-red mb-2">Georgia Format Resume</h2>
                </div>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => window.print()} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors">
                    <FiPrinter className="mr-2" /> Print
                  </button>
                  <button onClick={() => setDialogOpen(true)} className="px-6 py-3 bg-ga-red hover:opacity-90 text-white rounded-lg flex items-center transition-colors">
                    <FiDownload className="mr-2" /> Download Word
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div className={`bg-white print:shadow-none ${
            previewMode
              ? 'mx-4 my-4 rounded-xl shadow-md border border-gray-200 p-8'
              : 'border-2 border-gray-200 rounded-2xl p-10 shadow-xl mt-6'
          }`}
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >

            {/* Name header */}
            <header className="mb-6 text-center">
              <h1 className="text-4xl font-bold tracking-wide uppercase" style={{ color: 'var(--color-ga-red)' }}>
                {resumeData.name || 'Candidate Name'}
              </h1>
              <div className="mt-2 h-0.5 mx-auto" style={{ background: 'var(--color-ga-red)', width: '60%' }} />
            </header>

            {/* Employment History */}
            {(resumeData.employmentHistory?.length ?? 0) > 0 && (
              <section className="mb-6">
                <SectionTitle label="Employment History" />
                {resumeData.employmentHistory!.map((job, i) => {
                  const loc = formatEmploymentLocation(job.location ?? '');
                  const period = normalizeMonthAbbr(job.workPeriod ?? '');
                  // Combine responsibilities + description so prose-only entries still get bullets.
                  const rawPoints: string[] = [
                    ...(job.responsibilities ?? []),
                    ...(job.description && !(job.responsibilities ?? []).length ? [job.description] : []),
                  ].filter(r => r && r.trim());
                  const points = rawPoints.flatMap(splitProseToBullets);
                  return (
                    <div key={i} className="mb-5">
                      <div className="flex justify-between items-baseline flex-wrap gap-1">
                        <h3 className="font-bold text-lg" style={{ color: 'var(--color-ga-dark)' }}>{job.companyName}</h3>
                        <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{period}</span>
                      </div>
                      <div className="flex justify-between items-baseline flex-wrap gap-1">
                        <p className="italic text-gray-800">{job.roleName}</p>
                        {loc && <span className="text-gray-600 text-sm">{loc}</span>}
                      </div>
                      {job.department && <p className="text-sm text-gray-600 mt-0.5">{job.department}</p>}
                      {points.length > 0 && (
                        <ul className="mt-2 space-y-1 list-disc pl-6">
                          {points.map((r, j) => (
                            <li key={j} className="text-gray-800 text-sm leading-snug">{stripBullet(r)}</li>
                          ))}
                        </ul>
                      )}
                      {job.keyTechnologies && (
                        <p className="mt-2 text-sm text-gray-700">
                          <span className="font-semibold">Technologies: </span>{job.keyTechnologies}
                        </p>
                      )}
                    </div>
                  );
                })}
              </section>
            )}

            {/* Education */}
            {sortedEdu.length > 0 && (
              <section className="mb-6">
                <SectionTitle label="Education" />
                <div className="space-y-2">
                  {sortedEdu.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--color-ga-dark)' }}>
                          {edu.degree}{edu.areaOfStudy ? ` in ${edu.areaOfStudy}` : ''}
                        </p>
                        <p className="text-gray-700">{edu.school}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{edu.date}</p>
                        <p>{getEducationCountry(edu.location)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Summary */}
            {(resumeData.professionalSummary?.length ?? 0) > 0 && (
              <section className="mb-6">
                <SectionTitle label="Professional Summary" />
                {(() => {
                  const items = (resumeData.professionalSummary ?? []).flatMap(splitProseToBullets);
                  return (
                    <ul className="space-y-1 list-disc pl-6">
                      {items.map((t, i) => (
                        <li key={i} className="text-gray-800 leading-snug">{t}</li>
                      ))}
                    </ul>
                  );
                })()}
              </section>
            )}

            {/* Technical Skills — Area / Skills table */}
            {skillRows.length > 0 && (
              <section className="mb-6">
                <SectionTitle label="Technical Skills" />
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr style={{ background: 'var(--color-ga-cream)' }}>
                      <th className="text-left px-3 py-2 border border-gray-300 font-bold w-1/3" style={{ color: 'var(--color-ga-dark)' }}>Area</th>
                      <th className="text-left px-3 py-2 border border-gray-300 font-bold" style={{ color: 'var(--color-ga-dark)' }}>Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillRows.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 border border-gray-300 font-semibold align-top text-gray-800">{row.area}</td>
                        <td className="px-3 py-2 border border-gray-300 align-top text-gray-700">{row.skills}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Certifications */}
            {(resumeData.certifications?.length ?? 0) > 0 && (
              <section className="mb-6">
                <SectionTitle label="Certifications" />
                <ul className="space-y-1 list-disc pl-6">
                  {resumeData.certifications!.map((cert, i) => (
                    <li key={i} className="text-gray-800 leading-snug">
                      <span className="font-semibold">{cert.name}</span>
                      {cert.issuedBy ? ` — ${cert.issuedBy}` : ''}
                      {cert.dateObtained ? ` (${cert.dateObtained})` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>
        </div>
      </>
    );
  },
);

GeorgiaFormat.displayName = 'GeorgiaFormat';

const SectionTitle = ({ label }: { label: string }) => (
  <div className="mb-3 border-b-2 pb-1" style={{ borderColor: 'var(--color-ga-red)' }}>
    <h2 className="text-base font-bold uppercase tracking-widest" style={{ color: 'var(--color-ga-red)' }}>
      {label}
    </h2>
  </div>
);

export default GeorgiaFormat;
