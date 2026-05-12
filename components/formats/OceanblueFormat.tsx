'use client';

import React from 'react';
import Image from 'next/image';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet,
  normalizeMonthAbbr,
  sortEducation,
  getEdLocation,
  groupResponsibilities,
  formatLocation,
} from '@/lib/docx/shared';
import { splitProseToBullets } from '@/formatters/shared/utils';

const TEXT    = '#111111';
const SUBTEXT = '#444444';

function resolveLocation(raw: string): string {
  const f = formatLocation(raw ?? '');
  return /^(remote|work from home|wfh|n\/a)$/i.test(f.trim()) ? '' : f;
}

function shortenLinkedIn(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `linkedin.com${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}

const SectionHeader = ({ label }: { label: string }) => (
  <p style={{
    margin: '0 0 6px',
    fontSize: 12,
    fontWeight: 700,
    color: TEXT,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontFamily: 'Calibri, Arial, sans-serif',
  }}>
    {label}
  </p>
);

interface Props {
  resumeData: ResumeData;
}

const OceanblueFormat: React.FC<Props> = ({ resumeData }) => {
  const sortedEdu = sortEducation(resumeData.education ?? []);

  const contactItems: string[] = [];
  if (resumeData.email)    contactItems.push(resumeData.email);
  if (resumeData.phone)    contactItems.push(resumeData.phone);
  if (resumeData.linkedin) contactItems.push(shortenLinkedIn(resumeData.linkedin));
  if (resumeData.location) contactItems.push(resumeData.location);

  const hasSkills =
    (resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0) ||
    (resumeData.skillCategories?.length ?? 0) > 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-100 px-4 py-5">
      <div
        className="bg-white mx-auto shadow-md rounded-lg overflow-hidden"
        style={{ maxWidth: 760, fontFamily: 'Calibri, Arial, sans-serif', fontSize: 13, color: TEXT }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '22px 28px 16px' }}>

          {/* Logo — top left */}
          <div style={{ marginBottom: 14 }}>
            <Image
              src="/logo.webp"
              alt="Oceanblue"
              height={48}
              width={200}
              style={{ height: 48, width: 'auto', objectFit: 'contain', display: 'block' }}
              priority
            />
          </div>

          {/* Name — centered */}
          <h1 style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', textAlign: 'center' }}>
            {resumeData.name || 'Full Name'}
          </h1>

          {/* Title — centered */}
          {resumeData.title && (
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: SUBTEXT, textAlign: 'center' }}>
              {resumeData.title}
            </p>
          )}

          {/* Contact row — centered */}
          {contactItems.length > 0 && (
            <p style={{ margin: 0, fontSize: 11, color: SUBTEXT, lineHeight: 1.6, textAlign: 'center' }}>
              {contactItems.join('  |  ')}
            </p>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '0 28px 24px' }}>

          {/* Professional Summary */}
          {(resumeData.professionalSummary?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Professional Summary" />
              {(() => {
                const items = (resumeData.professionalSummary ?? []).flatMap(splitProseToBullets);
                return (
                  <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                    {items.map((pt, i) => (
                      <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.55, marginBottom: 3 }}>{pt}</li>
                    ))}
                  </ul>
                );
              })()}
            </section>
          )}

          {/* Technical Skills — categories */}
          {hasSkills && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Technical Skills" />
              {resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0 &&
                Object.entries(resumeData.technicalSkills).map(([cat, skills]) => (
                  <p key={cat} style={{ margin: '0 0 3px', fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{cat}: </span>
                    <span style={{ color: SUBTEXT }}>
                      {Array.isArray(skills) ? skills.join(', ') : String(skills)}
                    </span>
                  </p>
                ))
              }
              {(resumeData.skillCategories ?? [])
                .filter(c => Array.isArray(c.skills) && c.skills.length > 0)
                .map((c, i) => (
                  <p key={i} style={{ margin: '0 0 3px', fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{c.categoryName}: </span>
                    <span style={{ color: SUBTEXT }}>{c.skills.join(', ')}</span>
                  </p>
                ))}
            </section>
          )}

          {/* Work Experience */}
          {(resumeData.employmentHistory?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Work Experience" />
              {resumeData.employmentHistory!.map((job, i) => {
                const loc    = resolveLocation(job.location ?? '');
                const period = normalizeMonthAbbr(job.workPeriod ?? '');
                const rawPoints: string[] = [
                  ...((job.responsibilities ?? []).filter(r => r.trim())),
                  ...(job.description && !(job.responsibilities ?? []).filter(r => r.trim()).length ? [job.description] : []),
                ];
                const grouped = groupResponsibilities(rawPoints).flatMap(splitProseToBullets);
                return (
                  <div key={i} style={{ marginBottom: i < resumeData.employmentHistory!.length - 1 ? 14 : 0 }}>

                    {/* Company + Period */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>{job.companyName}</span>
                      <span style={{ fontSize: 11, color: SUBTEXT, whiteSpace: 'nowrap', marginLeft: 10 }}>{period}</span>
                    </div>

                    {/* Role + Location */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: SUBTEXT, fontStyle: 'italic' }}>{job.roleName}</span>
                      {loc && <span style={{ fontSize: 11, color: SUBTEXT, whiteSpace: 'nowrap', marginLeft: 10 }}>{loc}</span>}
                    </div>

                    {/* Responsibility bullets */}
                    {grouped.length > 0 && (
                      <ul style={{ margin: '0 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                        {grouped.map((r, j) => (
                          <li key={j} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>{r}</li>
                        ))}
                      </ul>
                    )}

                    {/* Sub-projects (consulting structure) */}
                    {(job.projects ?? []).map((proj, pi) => {
                      const subResps = (proj.projectResponsibilities ?? []).filter(r => r.trim());
                      return (
                        <div key={pi} style={{ marginTop: 6, paddingLeft: 14 }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 12, color: TEXT }}>
                            {proj.projectName}
                          </p>
                          {subResps.length > 0 && (
                            <ul style={{ margin: '0 0 0 14px', padding: 0, listStyleType: 'circle' }}>
                              {subResps.map((r, ri) => (
                                <li key={ri} style={{ fontSize: 11, color: SUBTEXT, lineHeight: 1.45, marginBottom: 1 }}>
                                  {stripBullet(r)}
                                </li>
                              ))}
                            </ul>
                          )}
                          {proj.keyTechnologies && (
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: SUBTEXT }}>
                              <span style={{ fontWeight: 700 }}>Technologies: </span>
                              {proj.keyTechnologies}
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
                          {sub.title && (
                            <p style={{ margin: '0 0 1px', fontWeight: 700, fontSize: 12, color: TEXT }}>{sub.title}:</p>
                          )}
                          {items.length > 0 && (
                            <p style={{ margin: 0, fontSize: 12, color: SUBTEXT }}>
                              {items.map(r => stripBullet(r)).join(', ')}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {job.keyTechnologies && (
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: SUBTEXT }}>
                        <span style={{ fontWeight: 700 }}>Technologies: </span>{job.keyTechnologies}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Standalone Projects */}
          {(resumeData.projects?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Projects" />
              {resumeData.projects!.map((proj, i) => (
                <div key={i} style={{ marginBottom: i < resumeData.projects!.length - 1 ? 12 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>{proj.name}</span>
                    {proj.date && (
                      <span style={{ fontSize: 11, color: SUBTEXT, whiteSpace: 'nowrap', marginLeft: 10 }}>{proj.date}</span>
                    )}
                  </div>
                  {proj.role && (
                    <p style={{ margin: '1px 0 3px', fontSize: 12, fontStyle: 'italic', color: SUBTEXT }}>{proj.role}</p>
                  )}
                  {proj.description && (
                    <p style={{ margin: '2px 0 3px', fontSize: 12, color: SUBTEXT, lineHeight: 1.5 }}>{proj.description}</p>
                  )}
                  {(proj.highlights?.length ?? 0) > 0 && (
                    <ul style={{ margin: '2px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                      {proj.highlights!.map((h, j) => (
                        <li key={j} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 1 }}>{h}</li>
                      ))}
                    </ul>
                  )}
                  {(proj.technologies?.length ?? 0) > 0 && (
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: SUBTEXT }}>
                      <span style={{ fontWeight: 700 }}>Technologies: </span>
                      {proj.technologies!.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education — last */}
          {sortedEdu.length > 0 && (
            <section>
              <SectionHeader label="Education" />
              {sortedEdu.map((edu, i) => {
                const loc = getEdLocation(edu.location ?? '');
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: TEXT }}>
                      {edu.degree && <strong>{edu.degree}</strong>}
                      {edu.areaOfStudy && <span style={{ color: SUBTEXT }}>{' '}in {edu.areaOfStudy}</span>}
                      {edu.school && (
                        <span style={{ color: SUBTEXT }}>
                          {' '}—{' '}{edu.school}{loc ? `, ${loc}` : ''}
                        </span>
                      )}
                    </span>
                    {edu.date && (
                      <span style={{ fontSize: 11, color: SUBTEXT, whiteSpace: 'nowrap', marginLeft: 10 }}>
                        {edu.date}
                      </span>
                    )}
                  </div>
                );
              })}
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default OceanblueFormat;
