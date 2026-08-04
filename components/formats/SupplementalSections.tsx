'use client';

import React from 'react';
import type { ResumeData } from '@/lib/types';
import { stripBullet } from '@/lib/docx/shared';

/**
 * Shared preview renderer for the supplemental resume sections:
 * Patents, Conferences & Talks, Courses, Training, References.
 *
 * Awards, publications, languages, volunteer experience, memberships and
 * interests are not rendered — the engine no longer extracts them.
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
