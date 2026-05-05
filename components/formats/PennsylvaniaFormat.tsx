'use client';

import React, { useState } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet, normalizeMonthAbbr, splitBulletItems,
  sortEducation, formatEmploymentLocation, getEducationCountry,
} from '@/formatters/shared/utils';
import StateDownloadDialog from './StateDownloadDialog';

interface Props {
  resumeData: ResumeData;
  previewMode?: boolean;
}

const PennsylvaniaFormat = React.forwardRef<HTMLDivElement, Props>(
  ({ resumeData, previewMode = false }, _ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const sortedEdu = sortEducation(resumeData.education ?? []);

    return (
      <>
        <StateDownloadDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          resumeData={resumeData}
        />

        <div className={previewMode ? 'flex flex-col h-full' : 'max-w-4xl mx-auto'}>

          {/* Action bar */}
          <div className={`sticky top-0 z-10 border-b border-gray-200 shadow-sm ${
            previewMode
              ? 'bg-gradient-to-r from-pa-dark to-[#7a5f00] px-5 py-3'
              : 'bg-white px-6 py-4'
          }`}>
            {previewMode ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-pa-gold animate-pulse" />
                  <span className="text-white text-sm font-semibold tracking-wide">Pennsylvania Format</span>
                  <span className="text-yellow-300 text-xs">— updates as you edit</span>
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
                    className="flex items-center px-3 py-1.5 bg-pa-gold text-pa-dark hover:opacity-90 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <FiDownload className="mr-1.5" /> Export
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold text-pa-dark mb-2">Pennsylvania Format Resume</h2>
                </div>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => window.print()} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors">
                    <FiPrinter className="mr-2" /> Print
                  </button>
                  <button onClick={() => setDialogOpen(true)} className="px-6 py-3 bg-pa-dark hover:opacity-90 text-white rounded-lg flex items-center transition-colors">
                    <FiDownload className="mr-2" /> Download Word
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Body */}
          <div className={`bg-white print:shadow-none ${
            previewMode
              ? 'mx-4 my-4 rounded-xl shadow-md border border-gray-200 p-6'
              : 'border-2 border-gray-200 rounded-2xl p-8 shadow-xl mt-6'
          }`}>

            {/* PA Header — navy bar + gold accent */}
            <header className="mb-6">
              <div className="bg-pa-dark text-white rounded-t-lg px-6 py-4 text-center">
                <h1 className="text-3xl font-extrabold tracking-wide">{resumeData.name || 'Full Name'}</h1>
                {resumeData.title && (
                  <p className="text-pa-gold font-semibold mt-1 text-lg">{resumeData.title}</p>
                )}
              </div>
              <div className="h-1.5 bg-pa-gold rounded-b-lg" />
              {resumeData.requisitionNumber && (
                <p className="text-center text-gray-600 mt-2 text-sm">
                  <span className="font-semibold">Requisition #:</span> {resumeData.requisitionNumber}
                </p>
              )}
            </header>

            {/* Professional Summary */}
            {(resumeData.professionalSummary?.length ?? 0) > 0 && (
              <section className="mb-6">
                <SectionTitle label="Professional Summary" />
                {(() => {
                  const items = (resumeData.professionalSummary ?? []).flatMap(p => splitBulletItems(p));
                  return items.length > 1
                    ? <ul className="space-y-1">{items.map((t, i) => <li key={i} className="flex gap-2 text-gray-700"><span className="text-pa-gold mt-0.5">▶</span>{t}</li>)}</ul>
                    : <p className="text-gray-700 text-justify leading-relaxed">{items[0]}</p>;
                })()}
              </section>
            )}

            {/* Employment History */}
            {(resumeData.employmentHistory?.length ?? 0) > 0 && (
              <section className="mb-6">
                <SectionTitle label="Employment History" />
                {resumeData.employmentHistory!.map((job, i) => {
                  const loc = formatEmploymentLocation(job.location ?? '');
                  const period = normalizeMonthAbbr(job.workPeriod ?? '');
                  return (
                    <div key={i} className="mb-5 pl-4 border-l-4 border-pa-gold">
                      <div className="flex justify-between items-baseline flex-wrap gap-1">
                        <h3 className="font-bold text-pa-dark text-lg">{job.companyName}</h3>
                        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{period}</span>
                      </div>
                      <div className="flex justify-between items-baseline flex-wrap gap-1 mt-0.5">
                        <p className="font-semibold text-gray-800">{job.roleName}</p>
                        {loc && <span className="text-gray-500 text-sm">{loc}</span>}
                      </div>
                      {job.department && <p className="text-sm text-gray-600 italic mt-0.5">{job.department}</p>}
                      {job.description && <p className="mt-2 text-gray-700">{job.description}</p>}
                      {(job.responsibilities?.length ?? 0) > 0 && (
                        <ul className="mt-2 space-y-1">
                          {job.responsibilities.map((r, j) => (
                            <li key={j} className="flex gap-2 text-gray-700 text-sm">
                              <span className="text-pa-gold mt-0.5 flex-shrink-0">•</span>
                              {stripBullet(r)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {job.keyTechnologies && (
                        <p className="mt-2 text-sm text-gray-600">
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
                <div className="grid gap-3">
                  {sortedEdu.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div>
                        <h3 className="font-bold text-pa-dark">
                          {edu.degree}{edu.areaOfStudy ? ` in ${edu.areaOfStudy}` : ''}
                        </h3>
                        <p className="text-gray-700">{edu.school}</p>
                        <p className="text-sm text-gray-500 italic">{edu.wasAwarded ? 'Degree awarded' : 'In progress'}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{edu.date}</p>
                        <p>{getEducationCountry(edu.location)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {(resumeData.certifications?.length ?? 0) > 0 && (
              <section className="mb-6">
                <SectionTitle label="Certifications & Licenses" />
                <div className="grid gap-2">
                  {resumeData.certifications!.map((cert, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <span className="text-pa-gold text-xl mt-0.5">🏅</span>
                      <div>
                        <p className="font-bold text-pa-dark">{cert.name}</p>
                        {cert.issuedBy && <p className="text-sm text-gray-600">{cert.issuedBy}</p>}
                        <p className="text-xs text-gray-500">
                          {cert.dateObtained ? `Obtained: ${cert.dateObtained}` : ''}
                          {cert.expirationDate ? `  Expires: ${cert.expirationDate}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {((resumeData.skillCategories?.length ?? 0) > 0 ||
              (resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0)) && (
              <section className="mb-6">
                <SectionTitle label="Technical Skills" />
                {(resumeData.skillCategories?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resumeData.skillCategories!.map((cat, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <h4 className="font-bold text-pa-dark text-sm mb-1">{cat.categoryName}</h4>
                        <p className="text-gray-700 text-sm">{cat.skills.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                )}
                {resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(resumeData.technicalSkills).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <h4 className="font-bold text-pa-dark text-sm mb-1">{k}</h4>
                        <p className="text-gray-700 text-sm">{Array.isArray(v) ? v.join(', ') : v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </>
    );
  },
);

PennsylvaniaFormat.displayName = 'PennsylvaniaFormat';

const SectionTitle = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-3">
    <h2 className="text-lg font-extrabold text-pa-dark uppercase tracking-wider whitespace-nowrap">{label}</h2>
    <div className="flex-1 h-0.5 bg-pa-gold" />
  </div>
);

export default PennsylvaniaFormat;
