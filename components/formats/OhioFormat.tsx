'use client';

import React, { useState } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet, normalizeMonthAbbr, splitBulletItems, splitProseToBullets,
  sortEducation, formatEmploymentLocation, getEducationCountry, formatProjectParts,
} from '@/formatters/shared/utils';
import StateDownloadDialog from './StateDownloadDialog';

// ── PricingDisplay ────────────────────────────────────────────────────────────

const PricingDisplay: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => {
  const t = resumeData.tokenStats;
  if (!t) return null;
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-xl shadow-sm">
      <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Processing Analytics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Input Tokens',  value: t.promptTokens?.toLocaleString() ?? '0' },
          { label: 'Output Tokens', value: t.completionTokens?.toLocaleString() ?? '0' },
          { label: 'Total Tokens',  value: t.totalTokens?.toLocaleString() ?? '0' },
          { label: 'Cost', value: `$${typeof t.cost === 'number' ? t.cost.toFixed(6) : '0.000000'}`, green: true },
        ].map(({ label, value, green }) => (
          <div key={label} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500">{label}</div>
            <div className={`text-base font-semibold ${green ? 'text-green-600' : 'text-blue-900'}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── GeneratedResume ───────────────────────────────────────────────────────────

interface GeneratedResumeProps {
  resumeData: ResumeData;
  previewMode?: boolean;
  onGoToSave?: () => void;
}

const OhioFormat = React.forwardRef<HTMLDivElement, GeneratedResumeProps>(
  ({ resumeData, previewMode = false, onGoToSave }, _ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const sortedEducation = sortEducation(resumeData.education ?? []);

    return (
      <>
        <StateDownloadDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          resumeData={resumeData}
        />

        <div className={previewMode ? 'flex flex-col h-full' : 'max-w-4xl mx-auto animate-slide-up'}>

          {/* Action bar */}
          <div className={`sticky top-0 z-10 border-b border-gray-200 shadow-sm ${
            previewMode
              ? 'bg-gradient-to-r from-ocean-dark to-[#0b6cb5] px-5 py-3'
              : 'bg-white px-6 py-4'
          }`}>
            {previewMode ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-white text-sm font-semibold tracking-wide">Ohio Format</span>
                  <span className="text-blue-300 text-xs">— updates as you edit</span>
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
                    className="flex items-center px-3 py-1.5 bg-white text-blue-900 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <FiDownload className="mr-1.5" /> Export
                  </button>
                  {onGoToSave && (
                    <button
                      onClick={onGoToSave}
                      className="flex items-center px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all border border-white/20"
                    >
                      ☁️ Save →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <PricingDisplay resumeData={resumeData} />
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold text-blue-900 mb-2">Ohio Format Resume</h2>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors"
                  >
                    <FiPrinter className="mr-2" /> Print
                  </button>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg flex items-center transition-colors"
                  >
                    <FiDownload className="mr-2" /> Download Word
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resume preview body */}
          <div
            className={`bg-white print:shadow-none ${
              previewMode
                ? 'mx-4 my-4 rounded-xl shadow-md border border-gray-200 p-6'
                : 'border-2 border-gray-200 rounded-2xl p-8 shadow-xl mt-6'
            }`}
            id="resume-preview"
          >
            {/* Header */}
            <header className="border-b-2 border-blue-600 pb-6 mb-6">
              <h1 className="text-4xl font-bold text-center mb-3 text-blue-900">{resumeData.name || 'Full Name'}</h1>
              <p className="text-xl text-center text-blue-600 mb-4 font-medium">{resumeData.title || 'Professional Title'}</p>
              {resumeData.requisitionNumber && (
                <p className="text-center text-gray-600 bg-gray-50 py-2 px-4 rounded-lg inline-block">
                  <span className="font-medium">Requisition Number:</span> {resumeData.requisitionNumber}
                </p>
              )}
            </header>

            {/* Education */}
            {sortedEducation.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-3">Education</h2>
                {sortedEducation.map((edu, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{edu.degree || 'Degree'} {edu.areaOfStudy ? `in ${edu.areaOfStudy}` : ''}</h3>
                        <p className="text-gray-800">{edu.school || 'Institution'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">{edu.date || 'Date'}</p>
                        <p className="text-gray-600">{getEducationCountry(edu.location) || 'Location'}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">{edu.wasAwarded ? 'Degree awarded' : 'Degree in progress'}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Certifications */}
            {(resumeData.certifications?.length ?? 0) > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-3">Certifications</h2>
                {resumeData.certifications!.map((cert, i) => (
                  <div key={i} className="mb-3">
                    <h3 className="font-bold">{cert.name || 'Certification'}</h3>
                    <p className="text-gray-800">
                      {cert.issuedBy ? `Issued by: ${cert.issuedBy}` : ''}
                      {cert.dateObtained ? ` • Obtained: ${cert.dateObtained}` : ''}
                    </p>
                    {cert.expirationDate && <p className="text-gray-600">Expires: {cert.expirationDate}</p>}
                    {cert.certificationNumber && <p className="text-gray-600">Cert #: {cert.certificationNumber}</p>}
                  </div>
                ))}
              </section>
            )}

            {/* Employment History */}
            {(resumeData.employmentHistory?.length ?? 0) > 0 && (
              <section className="mb-6">
                <h2 className="text-xl font-semibold border-b-2 border-blue-600 pb-2 mb-4 text-blue-900">Employment History</h2>
                {resumeData.employmentHistory!.map((job, i) => {
                  const loc = formatEmploymentLocation(job.location ?? '');
                  const dept = (job.department ?? job.subRole ?? '').trim();
                  const period = normalizeMonthAbbr(job.workPeriod ?? '');
                  return (
                    <div key={i} className="mb-6">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-lg text-blue-900">{job.companyName || 'Company'}</h3>
                        <span className="text-gray-700 font-semibold text-sm whitespace-nowrap ml-4">{period}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium text-gray-800">{job.roleName || 'Role'}</p>
                        {loc && <span className="text-gray-600 text-sm whitespace-nowrap ml-4">{loc}</span>}
                      </div>
                      {dept && <p className="text-sm text-gray-700 mt-0.5">{dept}</p>}
                      {(() => {
                        const rawPoints = (job.responsibilities ?? []).filter(r => r.trim());
                        const points = rawPoints.flatMap(splitProseToBullets);
                        if (!points.length) return null;
                        return (
                          <div className="mt-2">
                            <p className="font-semibold text-gray-700 text-sm mb-1">Responsibilities</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {points.map((r, j) => <li key={j} className="text-gray-800">{stripBullet(r)}</li>)}
                            </ul>
                          </div>
                        );
                      })()}

                      {job.projects && job.projects.length > 0 && (
                        <div className="mt-3">
                          {job.projects.map((proj, pi) => {
                            const { prefix, name } = formatProjectParts(
                              { ...proj, projectLocation: proj.projectLocation ?? job.location ?? '' },
                              pi, job.projects!.length,
                            );
                            return (
                              <div key={pi} className="border-l-2 border-blue-200 pl-4 mb-3 bg-blue-50 p-3 rounded">
                                {prefix && <p className="font-semibold text-blue-900 text-sm">{prefix}</p>}
                                <h5 className="font-semibold text-blue-900 mb-1">{name}</h5>
                                {proj.keyTechnologies && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Technologies: </span>{proj.keyTechnologies}
                                  </p>
                                )}
                                {(proj.projectResponsibilities?.length ?? 0) > 0 && (
                                  <>
                                    <p className="font-semibold text-gray-700 text-sm mb-1">Responsibilities</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {proj.projectResponsibilities.map((r, ri) => (
                                        <li key={ri} className="text-gray-800 text-sm">{stripBullet(r)}</li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {job.subsections?.map((sub, si) => (
                        <div key={si} className="mt-3">
                          {sub.title && <p className="font-medium">{sub.title}:</p>}
                          {(sub.content?.length ?? 0) > 0 && (
                            <ul className="list-disc pl-5 space-y-1">
                              {sub.content.map((item, ci) => <li key={ci} className="text-gray-800">{stripBullet(item)}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}

                      {job.keyTechnologies && (
                        <p className="mt-2">
                          <span className="font-medium">Key Technologies/Skills: </span>
                          <span className="text-gray-800">{job.keyTechnologies}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </section>
            )}

            {/* Professional Summary */}
            {((resumeData.professionalSummary?.length ?? 0) > 0 ||
              (resumeData.summarySections?.length ?? 0) > 0 ||
              (resumeData.subsections?.length ?? 0) > 0) && (
              <section className="mb-6">
                <h2 className="text-xl font-semibold border-b-2 border-blue-600 pb-2 mb-4 text-blue-900">Professional Summary</h2>
                {(resumeData.professionalSummary?.length ?? 0) > 0 && (
                  <div className="mb-4">
                    {(() => {
                      const items = (resumeData.professionalSummary ?? []).flatMap(splitProseToBullets);
                      return (
                        <ul className="space-y-1 pl-1">{items.map((item, i) => (
                          <li key={i} className="flex items-start text-gray-800 text-justify">
                            <span className="mr-2 mt-0.5 text-blue-900 flex-shrink-0">•</span><span>{item}</span>
                          </li>
                        ))}</ul>
                      );
                    })()}
                  </div>
                )}
                {((resumeData.summarySections?.length ?? 0) > 0 || (resumeData.subsections?.length ?? 0) > 0) && (
                  <div className="mt-4 space-y-3">
                    {(resumeData.summarySections ?? resumeData.subsections ?? []).map((sub, i) => (
                      <div key={i} className="pl-3 py-1">
                        {sub.title && <h4 className="font-medium text-gray-800">{sub.title}</h4>}
                        {(sub.content?.length ?? 0) > 0 && (
                          <div className="space-y-1">
                            {sub.content.map((item, j) => <p key={j} className="text-gray-800 text-justify">{item}</p>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Technical Skills */}
            {((resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0) ||
              (resumeData.skillCategories?.length ?? 0) > 0) && (
              <section className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-3">Technical Skills</h2>
                {resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {Object.entries(resumeData.technicalSkills).map(([cat, skills]) => (
                      <div key={cat} className="border-l-2 border-blue-100 pl-3 py-1">
                        <h3 className="font-bold">{cat}</h3>
                        <p className="text-gray-800">{Array.isArray(skills) ? skills.join(', ') : skills}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(resumeData.skillCategories?.length ?? 0) > 0 && (
                  <div className="space-y-5">
                    {resumeData.skillCategories!.map((cat, i) => (
                      <div key={i} className="border-l-4 border-blue-200 pl-4 py-2">
                        <h3 className="font-bold text-lg text-blue-800">{cat.categoryName || 'Category'}</h3>
                        {cat.skills?.length > 0 && (
                          <p className="text-gray-800 mb-3 mt-1">
                            {Array.isArray(cat.skills) ? cat.skills.join(', ') : cat.skills}
                          </p>
                        )}
                        {cat.subCategories && cat.subCategories.length > 0 && (
                          <div className="ml-4 mt-3 space-y-3">
                            {cat.subCategories.map((sub, si) => (
                              <div key={si} className="border-l-2 border-gray-300 pl-3 py-1">
                                <h4 className="font-medium text-gray-700">{sub.name || 'Subcategory'}</h4>
                                {sub.skills?.length > 0 && (
                                  <ul className="list-disc pl-5 space-y-1 mt-1">
                                    {Array.isArray(sub.skills)
                                      ? sub.skills.map((s, sk) => <li key={sk} className="text-gray-800">{s}</li>)
                                      : <li className="text-gray-800">{sub.skills}</li>}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
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

OhioFormat.displayName = 'OhioFormat';
export default OhioFormat;
