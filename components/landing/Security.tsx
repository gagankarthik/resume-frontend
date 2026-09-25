/**
 * Where a resume goes, drawn as the trip it takes: up from the browser, read
 * in memory, back down as a record. The disk that never gets written to is
 * drawn struck out, because that absence is the point.
 */

const FONT = 'var(--font-public), system-ui, sans-serif';

export function DataPath() {
  const ink = '#0C1B33';
  const muted = '#55647D';
  const azure = '#2A45D8';
  const ocean = '#1AA3C8';

  return (
    <svg viewBox="0 0 560 300" className="h-auto w-full" role="img" aria-labelledby="dp-title">
      <title id="dp-title">
        The resume travels from your browser to the extraction service, is read in memory, and comes
        back to your browser as a record. It is not written to disk.
      </title>

      {/* your computer */}
      <g transform="translate(40 60)">
        <rect x="0" y="0" width="136" height="92" rx="10" fill="#fff" stroke={ink} strokeWidth="2" />
        <rect x="10" y="10" width="116" height="72" rx="4" fill="#EEF1FD" />
        {/* the record, as the brand mark */}
        <g transform="translate(48 26)">
          <path d="M19 1.04a19 19 0 0 0 0 37.92Z" fill={azure} />
          <clipPath id="dp-m"><circle cx="20" cy="20" r="19" /></clipPath>
          <g clipPath="url(#dp-m)" fill={ocean}>
            {[0, 1, 2, 3].map(b => <rect key={b} x="21" y={1 + b * 10.05} width="19" height="7.85" />)}
          </g>
        </g>
        <path d="M-14 100h164l-10 12H-4Z" fill="#fff" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <text x="108" y="206" textAnchor="middle" fontFamily={FONT} fontSize="14" fontWeight="600" fill={ink}>Your browser</text>
      <text x="108" y="225" textAnchor="middle" fontFamily={FONT} fontSize="12.5" fill={muted}>Keeps the record</text>

      {/* the trip */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M200 88h148" stroke={azure} strokeWidth="1.8" />
        <path d="m341 82 7 6-7 6" stroke={azure} strokeWidth="1.8" />
        <path d="M348 132H200" stroke={ocean} strokeWidth="1.8" strokeDasharray="5 5" />
        <path d="m207 126-7 6 7 6" stroke={ocean} strokeWidth="1.8" />
      </g>
      <rect x="226" y="68" width="96" height="22" rx="11" fill="#fff" stroke="#DFE5EE" />
      <text x="274" y="83" textAnchor="middle" fontFamily={FONT} fontSize="12" fill={muted}>Resume file</text>
      <rect x="218" y="121" width="112" height="22" rx="11" fill="#fff" stroke="#DFE5EE" />
      <text x="274" y="136" textAnchor="middle" fontFamily={FONT} fontSize="12" fill={muted}>Extracted record</text>

      {/* the service: a processor, read in memory */}
      <g transform="translate(372 48)">
        <rect x="0" y="0" width="128" height="128" rx="18" fill={ink} />
        <rect x="30" y="30" width="68" height="68" rx="8" fill="#1E3564" stroke="#7FD3EA" strokeOpacity=".6" />
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i} stroke="#7FD3EA" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round">
            <path d={`M${40 + i * 12} 30v-10M${40 + i * 12} 98v10`} />
            <path d={`M30 ${40 + i * 12}h-10M98 ${40 + i * 12}h10`} />
          </g>
        ))}
        <path d="M50 64h28M64 50v28" stroke="#fff" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" />
        <circle cx="64" cy="64" r="11" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="2" />
      </g>
      <text x="436" y="206" textAnchor="middle" fontFamily={FONT} fontSize="14" fontWeight="600" fill={ink}>Extraction service</text>
      <text x="436" y="225" textAnchor="middle" fontFamily={FONT} fontSize="12.5" fill={muted}>Reads it in memory</text>

      {/* the disk that is never written */}
      <g transform="translate(436 262)">
        <rect x="-78" y="-17" width="156" height="34" rx="17" fill="#FDF0F1" />
        <g transform="translate(-54 0)">
          <ellipse cx="0" cy="-5" rx="7" ry="2.6" fill="none" stroke="#C8364A" strokeWidth="1.5" />
          <path d="M-7 -5v9c0 1.5 3.1 2.6 7 2.6s7-1.1 7-2.6v-9" fill="none" stroke="#C8364A" strokeWidth="1.5" />
          <path d="M-10 9 10 -9" stroke="#C8364A" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <text x="-36" y="4.5" fontFamily={FONT} fontSize="12.5" fontWeight="600" fill="#A12A3B">Not written to disk</text>
      </g>
    </svg>
  );
}

export const SECURITY_FACTS = [
  {
    title: 'Not written to disk',
    body: 'An uploaded file is held in memory while it is read, then released. It is never saved on our servers.',
  },
  {
    title: 'The full record lives in your browser',
    body: 'The extracted resume is kept in this browser until you clear it, so the editor and every export work from your copy.',
  },
  {
    title: 'The talent map keeps no contact details',
    body: 'For the talent map, only the employer, role, skills, experience and work location are saved to your organisation’s private workspace. Names, emails, phone numbers and home addresses are never saved.',
  },
  {
    title: 'Matching is scoped to your account',
    body: 'Resumes you add for matching are searched only for your account and never pooled with another company’s.',
  },
];

export function SecurityFacts() {
  return (
    <dl className="divide-y divide-tc-line border-y border-tc-line">
      {SECURITY_FACTS.map(f => (
        <div key={f.title} className="flex gap-4 py-5">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="mt-0.5 shrink-0 text-tc-mint" aria-hidden>
            <path d="M10 2.5 16 5v4.5c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V5l6-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="m7.3 10 1.9 1.9 3.6-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <dt className="text-[15.5px] font-semibold text-tc-ink">{f.title}</dt>
            <dd className="mt-1.5 text-[14.5px] leading-[1.6] text-tc-muted">{f.body}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
