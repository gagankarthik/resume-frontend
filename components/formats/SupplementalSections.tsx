'use client';

import React from 'react';
import type { ResumeData } from '@/lib/types';
import { stripBullet } from '@/lib/docx/shared';
import { splitProseToBullets } from '@/formatters/shared/utils';

/**
 * Shared preview renderer for the supplemental resume sections:
 * Awards, Publications, Languages, Volunteer Experience, Patents,
 * Professional Memberships, Conferences & Talks, Courses, Training,
 * Interests, References.
 *
 * Used by every format preview so none of them silently hides information
 * the backend extracted. Styling is parameterized to match the host format.
 */
interface Props {
  data: ResumeData;
  text: string;     // emphasis color (titles / bold leads)
  subtext: string;  // body color
  Header: React.FC<{ label: string }>;
}

const SupplementalSections: React.FC<Props> = ({ data, text, subtext, Header }) => {
  const li: React.CSSProperties = { fontSize: 12, color: subtext, lineHeight: 1.5, marginBottom: 2 };
  const bold: React.CSSProperties = { fontWeight: 700, color: text };

  return (
    <>
      {/* Awards & Honors */}
      {(data.awards?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Awards & Honors" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.awards!.map((a, i) => (
              <li key={i} style={li}>
                <span style={bold}>{a.title}</span>
                {a.issuer ? ` — ${a.issuer}` : ''}
                {a.date ? ` (${a.date})` : ''}
                {a.description ? ` · ${a.description}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Publications */}
      {(data.publications?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Publications" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.publications!.map((p, i) => (
              <li key={i} style={li}>
                <span style={bold}>{p.title}</span>
                {p.journal || p.publisher ? ` — ${p.journal ?? p.publisher}` : ''}
                {p.date ? ` (${p.date})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages */}
      {(data.languagesSpoken?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Languages" />
          <p style={{ margin: 0, fontSize: 12, color: subtext, lineHeight: 1.5 }}>
            {data.languagesSpoken!
              .map(l => (l.proficiency ? `${l.language} (${l.proficiency})` : l.language))
              .filter(Boolean)
              .join(', ')}
          </p>
        </section>
      )}

      {/* Volunteer Experience */}
      {(data.volunteerExperience?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Volunteer Experience" />
          {data.volunteerExperience!.map((v, i) => (
            <div key={i} style={{ marginBottom: i < data.volunteerExperience!.length - 1 ? 8 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ ...bold, fontSize: 12 }}>
                  {v.organization}{v.role ? ` — ${v.role}` : ''}
                </span>
                {v.period && <span style={{ fontSize: 11, color: subtext, whiteSpace: 'nowrap', marginLeft: 10 }}>{v.period}</span>}
              </div>
              {v.description && (
                <p style={{ margin: '1px 0 0', fontSize: 12, color: subtext, lineHeight: 1.5 }}>{v.description}</p>
              )}
              {(v.responsibilities?.length ?? 0) > 0 && (
                <ul style={{ margin: '2px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                  {v.responsibilities!.flatMap(splitProseToBullets).map((r, j) => (
                    <li key={j} style={li}>{stripBullet(r)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Patents */}
      {(data.patents?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Patents" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.patents!.map((p, i) => (
              <li key={i} style={li}>
                <span style={bold}>{p.title}</span>
                {p.patentNumber ? ` — ${p.patentNumber}` : ''}
                {p.date ? ` (${p.date})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Professional Memberships */}
      {(data.memberships?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Professional Memberships" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.memberships!.map((m, i) => (
              <li key={i} style={li}>
                <span style={bold}>{m.organization}</span>
                {m.role ? ` — ${m.role}` : ''}
                {m.period ? ` (${m.period})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Conferences & Talks */}
      {(data.conferences?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Conferences & Talks" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.conferences!.map((c, i) => (
              <li key={i} style={li}>
                <span style={bold}>{c.title}</span>
                {c.event ? ` — ${c.event}` : ''}
                {c.date ? ` (${c.date})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Courses */}
      {(data.courses?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Courses" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.courses!.map((c, i) => (
              <li key={i} style={li}>
                <span style={bold}>{c.name}</span>
                {c.provider ? ` — ${c.provider}` : ''}
                {c.date ? ` (${c.date})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Training */}
      {(data.training?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Training" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.training!.map((t, i) => (
              <li key={i} style={li}>
                <span style={bold}>{t.name}</span>
                {t.provider ? ` — ${t.provider}` : ''}
                {t.date ? ` (${t.date})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Interests */}
      {(data.interests?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 16 }}>
          <Header label="Interests" />
          <p style={{ margin: 0, fontSize: 12, color: subtext, lineHeight: 1.5 }}>
            {data.interests!.join(', ')}
          </p>
        </section>
      )}

      {/* References */}
      {(data.references?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 0 }}>
          <Header label="References" />
          <ul style={{ margin: 0, padding: '0 0 0 16px', listStyleType: 'disc' }}>
            {data.references!.map((r, i) => (
              <li key={i} style={li}>
                <span style={bold}>{r.name}</span>
                {r.title ? ` — ${r.title}` : ''}
                {r.company ? `, ${r.company}` : ''}
                {r.email ? ` · ${r.email}` : ''}
                {r.phone ? ` · ${r.phone}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default SupplementalSections;
