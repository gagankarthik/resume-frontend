'use client';

import React from 'react';
import type { ResumeData } from '@/lib/types';
import {
  stripBullet,
  normalizeMonthAbbr,
  sortEducation,
  getEdLocation,
  formatLocation,
} from '@/lib/docx/shared';
import { splitProseToBullets } from '@/formatters/shared/utils';

const TEXT    = '#111111';
const SUBTEXT = '#444444';
const BORDER  = '#cccccc';

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
    borderBottom: `1px solid ${BORDER}`,
    paddingBottom: 3,
  }}>
    {label}
  </p>
);

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

interface Props {
  resumeData: ResumeData;
}

const GeorgiaFormat: React.FC<Props> = ({ resumeData }) => {
  const sortedEdu  = sortEducation(resumeData.education ?? []);
  const skillRows  = collectSkillRows(resumeData);

  const contactItems: string[] = [];
  if (resumeData.email)    contactItems.push(resumeData.email);
  if (resumeData.phone)    contactItems.push(resumeData.phone);
  if (resumeData.linkedin) contactItems.push(shortenLinkedIn(resumeData.linkedin));
  if (resumeData.location) contactItems.push(resumeData.location);

  return (
    <div className="h-full overflow-y-auto bg-gray-100 px-4 py-5">
      <div
        className="bg-white mx-auto shadow-md rounded-lg overflow-hidden"
        style={{ maxWidth: 760, fontFamily: 'Calibri, Arial, sans-serif', fontSize: 13, color: TEXT }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '22px 28px 16px' }}>

          {/* Name — centered */}
          <h1 style={{
            margin: '0 0 3px',
            fontSize: 22,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: '0.04em',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>
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

          {/* Employment History */}
          {(resumeData.employmentHistory?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Employment History" />
              {resumeData.employmentHistory!.map((job, i) => {
                const loc    = resolveLocation(job.location ?? '');
                const period = normalizeMonthAbbr(job.workPeriod ?? '');
                const liveResps = (job.responsibilities ?? []).filter(r => r && r.trim());
                const points = liveResps.flatMap(splitProseToBullets);
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

                    {points.length > 0 && (
                      <ul style={{ margin: '0 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                        {points.map((r, j) => (
                          <li key={j} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>{stripBullet(r)}</li>
                        ))}
                      </ul>
                    )}

                    {/* Per-job projects (consulting structure) */}
                    {(job.projects ?? []).map((proj, pi) => {
                      const subResps = (proj.projectResponsibilities ?? []).filter(r => r.trim());
                      return (
                        <div key={pi} style={{ marginTop: 6, paddingLeft: 14 }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 12, color: TEXT }}>
                            {proj.projectName}
                          </p>
                          {subResps.length > 0 && (
                            <ul style={{ margin: '0 0 0 14px', padding: 0, listStyleType: 'circle' }}>
                              {subResps.flatMap(r => splitProseToBullets(r)).map((r, ri) => (
                                <li key={ri} style={{ fontSize: 11, color: SUBTEXT, lineHeight: 1.45, marginBottom: 1 }}>
                                  {stripBullet(r)}
                                </li>
                              ))}
                            </ul>
                          )}
                          {proj.keyTechnologies && (
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: SUBTEXT }}>
                              <span style={{ fontWeight: 700, color: TEXT }}>Technologies: </span>
                              {proj.keyTechnologies}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Per-job subsections */}
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
                        <span style={{ fontWeight: 700, color: TEXT }}>Key Technologies/Skills: </span>{job.keyTechnologies}
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
                      {proj.highlights!.flatMap(splitProseToBullets).map((h, j) => (
                        <li key={j} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 1 }}>{stripBullet(h)}</li>
                      ))}
                    </ul>
                  )}
                  {(proj.technologies?.length ?? 0) > 0 && (
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: SUBTEXT }}>
                      <span style={{ fontWeight: 700, color: TEXT }}>Technologies: </span>
                      {proj.technologies!.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {sortedEdu.length > 0 && (
            <section style={{ marginBottom: 16 }}>
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

              {/* Extra summary subsections — e.g. "Areas of Expertise" */}
              {(resumeData.summarySections ?? resumeData.subsections ?? []).map((sub, i) => {
                const items = (sub.content ?? []).filter(c => c.trim());
                if (!sub.title && !items.length) return null;
                return (
                  <div key={i} style={{ marginTop: 8 }}>
                    {sub.title && (
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 12, color: TEXT }}>{sub.title}</p>
                    )}
                    {items.length > 0 && (
                      <p style={{ margin: 0, fontSize: 12, color: SUBTEXT, lineHeight: 1.5 }}>
                        {items.map(r => stripBullet(r)).join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Technical Skills — verbatim "<Category>: <skills>" lines from the resume */}
          {skillRows.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Technical Skills" />
              {skillRows.map((row, i) => (
                <p key={i} style={{ margin: '0 0 3px', fontSize: 12, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: TEXT }}>{row.area}: </span>
                  <span style={{ color: SUBTEXT }}>{row.skills}</span>
                </p>
              ))}
            </section>
          )}

          {/* Certifications */}
          {(resumeData.certifications?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Certifications" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.certifications!.map((cert, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{cert.name}</span>
                    {cert.issuedBy ? ` — ${cert.issuedBy}` : ''}
                    {cert.dateObtained ? ` (${cert.dateObtained})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Awards & Honors */}
          {(resumeData.awards?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Awards & Honors" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.awards!.map((a, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{a.title}</span>
                    {a.issuer ? ` — ${a.issuer}` : ''}
                    {a.date ? ` (${a.date})` : ''}
                    {a.description ? ` · ${a.description}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Publications */}
          {(resumeData.publications?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Publications" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.publications!.map((p, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{p.title}</span>
                    {p.journal || p.publisher ? ` — ${p.journal ?? p.publisher}` : ''}
                    {p.date ? ` (${p.date})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Languages */}
          {(resumeData.languagesSpoken?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Languages" />
              <p style={{ margin: 0, fontSize: 12, color: SUBTEXT, lineHeight: 1.5 }}>
                {resumeData.languagesSpoken!
                  .map(l => l.proficiency ? `${l.language} (${l.proficiency})` : l.language)
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </section>
          )}

          {/* Volunteer Experience */}
          {(resumeData.volunteerExperience?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Volunteer Experience" />
              {resumeData.volunteerExperience!.map((v, i) => (
                <div key={i} style={{ marginBottom: i < resumeData.volunteerExperience!.length - 1 ? 8 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: TEXT }}>
                      {v.organization}{v.role ? ` — ${v.role}` : ''}
                    </span>
                    {v.period && <span style={{ fontSize: 11, color: SUBTEXT, whiteSpace: 'nowrap', marginLeft: 10 }}>{v.period}</span>}
                  </div>
                  {(v.responsibilities?.length ?? 0) > 0 && (
                    <ul style={{ margin: '2px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                      {v.responsibilities!.flatMap(splitProseToBullets).map((r, j) => (
                        <li key={j} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 1 }}>{stripBullet(r)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Patents */}
          {(resumeData.patents?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Patents" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.patents!.map((p, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{p.title}</span>
                    {p.patentNumber ? ` — ${p.patentNumber}` : ''}
                    {p.date ? ` (${p.date})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Professional Memberships */}
          {(resumeData.memberships?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Professional Memberships" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.memberships!.map((m, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{m.organization}</span>
                    {m.role ? ` — ${m.role}` : ''}
                    {m.period ? ` (${m.period})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Conferences & Talks */}
          {(resumeData.conferences?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Conferences & Talks" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.conferences!.map((c, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{c.title}</span>
                    {c.event ? ` — ${c.event}` : ''}
                    {c.date ? ` (${c.date})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Courses */}
          {(resumeData.courses?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Courses" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.courses!.map((c, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{c.name}</span>
                    {c.provider ? ` — ${c.provider}` : ''}
                    {c.date ? ` (${c.date})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Training */}
          {(resumeData.training?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Training" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.training!.map((t, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{t.name}</span>
                    {t.provider ? ` — ${t.provider}` : ''}
                    {t.date ? ` (${t.date})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Interests */}
          {(resumeData.interests?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHeader label="Interests" />
              <p style={{ margin: 0, fontSize: 12, color: SUBTEXT, lineHeight: 1.5 }}>
                {resumeData.interests!.join(', ')}
              </p>
            </section>
          )}

          {/* References */}
          {(resumeData.references?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 0 }}>
              <SectionHeader label="References" />
              <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
                {resumeData.references!.map((r, i) => (
                  <li key={i} style={{ fontSize: 12, color: SUBTEXT, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, color: TEXT }}>{r.name}</span>
                    {r.title ? ` — ${r.title}` : ''}
                    {r.company ? `, ${r.company}` : ''}
                    {r.email ? ` · ${r.email}` : ''}
                    {r.phone ? ` · ${r.phone}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default GeorgiaFormat;
