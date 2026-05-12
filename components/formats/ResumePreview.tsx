'use client';

import React from 'react';
import type { ResumeData } from '@/lib/types';
import { stripBullet, normalizeMonthAbbr, sortEducation, getEdLocation, formatLocation, groupResponsibilities } from '@/lib/docx/shared';
import OceanblueFormat from './OceanblueFormat';
import GeorgiaFormat from './GeorgiaFormat';

// Filter out non-geographic location values
function resolveLocation(raw: string): string {
  const f = formatLocation(raw ?? '');
  return /^(remote|work from home|wfh|n\/a)$/i.test(f.trim()) ? '' : f;
}

const ACCENT = '#1F497D';

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ borderBottom: `2px solid ${ACCENT}`, marginBottom: 12, paddingBottom: 4 }}>
    <h2 style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontSize: 15, fontWeight: 700, margin: 0 }}>
      {label}
    </h2>
  </div>
);

const REQ_LABEL: Record<'ohio' | 'pennsylvania', string> = {
  ohio: 'VectorVMS Requisition Number',
  pennsylvania: 'PeopleFluent Requisition Number',
};

interface ResumePreviewProps {
  resumeData: ResumeData;
  format?: 'ohio' | 'pennsylvania' | 'oceanblue' | 'georgia';
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, format = 'ohio' }) => {
  if (format === 'oceanblue') return <OceanblueFormat resumeData={resumeData} />;
  if (format === 'georgia')   return <GeorgiaFormat   resumeData={resumeData} />;

  const sortedEdu = sortEducation(resumeData.education ?? []);

  return (
    <div className="h-full overflow-y-auto bg-gray-100 px-4 py-5">
      <div
        className="bg-white mx-auto shadow-md rounded-lg overflow-hidden"
        style={{ maxWidth: 760, fontFamily: 'Calibri, Arial, sans-serif', fontSize: 13 }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '20px 28px 12px', borderBottom: `3px solid ${ACCENT}` }}>
          <h1 style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontSize: 22, fontWeight: 700, textAlign: 'center', margin: '0 0 4px' }}>
            {resumeData.name || 'Full Name'}
          </h1>
          {/* Title/Role + Requisition row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
            <div>
              <span style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontWeight: 700, fontSize: 13 }}>Title/Role: </span>
              <span style={{ fontSize: 13, color: '#333' }}>{resumeData.title || ''}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontWeight: 700, fontSize: 13 }}>{REQ_LABEL[format]}: </span>
              <span style={{ fontSize: 13, color: '#333' }}>{resumeData.requisitionNumber || ''}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 28px' }}>

          {/* ── Education ── */}
          {sortedEdu.length > 0 && (
            <section style={{ marginBottom: 18 }}>
              <SectionHeader label="Education" />
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: '#D9D9D9' }}>
                    {['Degree', 'Area of Study', 'School', 'Location', 'Awarded?', 'Date'].map(h => (
                      <th key={h} style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 700, fontFamily: 'Arial, sans-serif', fontSize: 11, border: '1px solid #bbb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedEdu.map((edu, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      {[edu.degree ?? '', edu.areaOfStudy ?? '', edu.school ?? '', getEdLocation(edu.location), edu.wasAwarded ? 'Yes' : 'No', edu.date ?? ''].map((v, j) => (
                        <td key={j} style={{ padding: '4px 6px', textAlign: 'center', border: '1px solid #bbb' }}>{v || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ── Certifications ── */}
          {(resumeData.certifications?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 18 }}>
              <SectionHeader label="Certifications and Certificates" />
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: '#D9D9D9' }}>
                    {['Certification', 'Issued By', 'Date Obtained', 'Cert Number', 'Expiration'].map(h => (
                      <th key={h} style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 700, fontFamily: 'Arial, sans-serif', fontSize: 11, border: '1px solid #bbb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resumeData.certifications!.map((c, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      {[c.name ?? '', c.issuedBy ?? '', c.dateObtained ?? '', c.certificationNumber ?? '', c.expirationDate ?? ''].map((v, j) => (
                        <td key={j} style={{ padding: '4px 6px', textAlign: 'center', border: '1px solid #bbb' }}>{v || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ── Employment History ── */}
          {(resumeData.employmentHistory?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 18 }}>
              <SectionHeader label="Employment History" />
              {resumeData.employmentHistory!.map((job, i) => {
                const loc = resolveLocation(job.location ?? '');
                const period = normalizeMonthAbbr(job.workPeriod ?? '');
                const dept = (job.department ?? '').trim();
                const mainResps = (job.responsibilities ?? []).filter(r => r.trim());
                return (
                  <div key={i} style={{ marginBottom: i < resumeData.employmentHistory!.length - 1 ? 12 : 0 }}>
                    {/* Company + Period */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontWeight: 700, fontSize: 14 }}>{job.companyName || 'Company'}</span>
                      <span style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', marginLeft: 12 }}>{period}</span>
                    </div>
                    {/* Role + Location */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontWeight: 700, fontSize: 13 }}>{job.roleName || 'Role'}</span>
                      {loc && <span style={{ color: ACCENT, fontFamily: 'Times New Roman, serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', marginLeft: 12 }}>{loc}</span>}
                    </div>
                    {dept && <p style={{ margin: '2px 0', color: '#555', fontSize: 12 }}>{dept}</p>}

                    {/* Main responsibilities — sub-bullets (○) grouped comma-joined */}
                    {mainResps.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <p style={{ margin: '0 0 2px', fontWeight: 700, color: ACCENT, fontSize: 12 }}>Responsibilities</p>
                        <div style={{ paddingLeft: 4 }}>
                          {groupResponsibilities(mainResps).map((r, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 2 }}>
                              <span style={{ flexShrink: 0, width: 14, color: '#333', fontSize: 12, lineHeight: '18px' }}>•</span>
                              <span style={{ fontSize: 12, color: '#222', lineHeight: '18px' }}>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sub-projects */}
                    {(job.projects ?? []).map((proj, pi) => {
                      const subResps = (proj.projectResponsibilities ?? []).filter(r => r.trim());
                      const title = proj.projectName || `Project ${pi + 1}`;
                      return (
                        <div key={pi} style={{ marginTop: 6, paddingLeft: 8, borderLeft: `2px solid #c8d8ea` }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, color: ACCENT, fontSize: 12 }}>{title}</p>
                          {subResps.length > 0 && (
                            <>
                              <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#444', fontSize: 11 }}>Responsibilities</p>
                              <p style={{ margin: 0, color: '#333', fontSize: 12 }}>{subResps.map(r => stripBullet(r)).join(', ')}</p>
                            </>
                          )}
                          {proj.keyTechnologies && (
                            <p style={{ margin: '2px 0 0', fontSize: 12 }}>
                              <span style={{ fontWeight: 700 }}>Key Technologies/Skills: </span>{proj.keyTechnologies}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Subsections */}
                    {(job.subsections ?? []).map((sub, si) => {
                      const items = (sub.content ?? []).filter(c => c.trim());
                      if (!sub.title && !items.length) return null;
                      return (
                        <div key={si} style={{ marginTop: 4 }}>
                          {sub.title && <p style={{ margin: '0 0 2px', fontWeight: 700, color: ACCENT, fontSize: 12 }}>{sub.title}:</p>}
                          {items.length > 0 && <p style={{ margin: 0, color: '#333', fontSize: 12 }}>{items.map(r => stripBullet(r)).join(', ')}</p>}
                        </div>
                      );
                    })}

                    {job.keyTechnologies && (
                      <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                        <span style={{ fontWeight: 700 }}>Key Technologies/Skills: </span>{job.keyTechnologies}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* ── Professional Summary ── */}
          {(resumeData.professionalSummary?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 18 }}>
              <SectionHeader label="Professional Summary" />
              {(resumeData.professionalSummary ?? []).map((pt, i) => (
                <p key={i} style={{ margin: '0 0 4px', color: '#222', fontSize: 12, lineHeight: 1.5 }}>{pt}</p>
              ))}
            </section>
          )}

          {/* ── Technical Skills ── */}
          {((resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0) ||
            (resumeData.skillCategories?.length ?? 0) > 0) && (
            <section>
              <SectionHeader label="Technical Skills" />
              {resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0 &&
                Object.entries(resumeData.technicalSkills).map(([cat, skills]) => (
                  <p key={cat} style={{ margin: '0 0 3px', fontSize: 12 }}>
                    <span style={{ fontWeight: 700 }}>{cat}: </span>
                    <span style={{ color: '#333' }}>{Array.isArray(skills) ? skills.join(', ') : String(skills)}</span>
                  </p>
                ))
              }
              {(resumeData.skillCategories ?? []).map((c, i) => (
                <p key={i} style={{ margin: '0 0 3px', fontSize: 12 }}>
                  <span style={{ fontWeight: 700 }}>{c.categoryName}: </span>
                  <span style={{ color: '#333' }}>{Array.isArray(c.skills) ? c.skills.join(', ') : ''}</span>
                </p>
              ))}
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
