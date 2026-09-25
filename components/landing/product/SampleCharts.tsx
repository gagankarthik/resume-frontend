import { EmblemShapes, EMBLEM_COLOR, type TemplateId } from '../illustrations/Emblems';

/**
 * Sample-data visuals for the marketing pages: plain charts and diagrams,
 * not screens from the app.
 */

const STATUS = {
  client: ['#0B8F68', 'Active client'],
  target: ['#B86E00', 'Target'],
  none: ['#2A45D8', 'Not engaged'],
  former: ['#8C99AE', 'Former client'],
} as const;

/** Companies ranked by talent in one skill set, coloured by client status. */
export function CompanyBars({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const d = tone === 'dark';
  const rows: [string, number, keyof typeof STATUS][] = [
    ['National bank', 64, 'none'],
    ['Insurance carrier', 41, 'client'],
    ['Health system', 28, 'target'],
    ['Software company', 22, 'none'],
    ['Retailer', 19, 'former'],
    ['State agency', 15, 'none'],
  ];
  const max = rows[0][1];
  return (
    <figure className={`rounded-[24px] border p-6 sm:p-8 ${d ? 'border-white/[0.08] bg-zinc-900/50' : 'border-tc-line bg-white'}`}>
      <figcaption className={`text-[15px] font-semibold ${d ? 'text-white' : 'text-tc-ink'}`}>
        Software developers in one metro, by employer
      </figcaption>
      <ul className="mt-6 space-y-3.5">
        {rows.map(([name, n, st]) => (
          <li key={name} className="grid grid-cols-[120px_minmax(0,1fr)_36px] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)_40px]">
            <span className={`truncate text-[14px] ${d ? 'text-zinc-300' : 'text-tc-ink'}`}>{name}</span>
            <span className={`h-3 overflow-hidden rounded-full ${d ? 'bg-zinc-800' : 'bg-tc-desk-2'}`}>
              <span className="block h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: STATUS[st][0] }} />
            </span>
            <span className={`text-right text-[14px] font-semibold tabular-nums ${d ? 'text-white' : 'text-tc-ink'}`}>{n}</span>
          </li>
        ))}
      </ul>
      <ul className={`mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t pt-4 text-[12.5px] ${d ? 'border-white/[0.08] text-zinc-400' : 'border-tc-line text-tc-muted'}`}>
        {Object.values(STATUS).map(([c, l]) => (
          <li key={l} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            {l}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** One resume in, four agency documents out. */
export function FormatFlow() {
  const outs: { id: TemplateId; label: string; y: number }[] = [
    { id: 'ohio', label: 'Ohio', y: 36 },
    { id: 'pennsylvania', label: 'Pennsylvania', y: 106 },
    { id: 'georgia', label: 'Georgia', y: 176 },
    { id: 'oceanblue', label: 'Oceanblue', y: 246 },
  ];
  const font = 'var(--font-public), system-ui, sans-serif';
  return (
    <svg viewBox="0 0 520 282" className="h-auto w-full" role="img" aria-label="One resume becomes the Ohio, Pennsylvania, Georgia and Oceanblue documents.">
      {/* whatever file arrives */}
      {[
        ['PDF', 96, '#C8364A'],
        ['Word', 136, '#2A45D8'],
        ['Text', 176, '#55647D'],
      ].map(([label, y, c]) => (
        <g key={label as string}>
          <rect x="24" y={(y as number) - 16} width="94" height="32" rx="16" fill="#fff" stroke="#CBD5E3" />
          <circle cx="44" cy={y as number} r="5" fill={c as string} />
          <text x="58" y={(y as number) + 5} fontFamily={font} fontSize="14" fontWeight="600" fill="#0C1B33">{label}</text>
        </g>
      ))}
      <text x="71" y="226" textAnchor="middle" fontFamily={font} fontSize="13" fill="#55647D">Any layout</text>

      {/* the check */}
      <g transform="translate(206 112)">
        <circle cx="32" cy="32" r="32" fill="#2A45D8" />
        <path d="m19 33 9 9 18-20" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="238" y="200" textAnchor="middle" fontFamily={font} fontSize="13" fill="#55647D">Checked, word for word</text>
      <path d="M118 144h86" stroke="#CBD5E3" strokeWidth="2" strokeDasharray="4 5" />

      {/* the documents */}
      {outs.map(o => (
        <g key={o.id}>
          <path d={`M272 144 C 320 144, 318 ${o.y}, 360 ${o.y}`} fill="none" stroke={EMBLEM_COLOR[o.id].main} strokeOpacity=".35" strokeWidth="2" />
          <circle cx="386" cy={o.y} r="24" fill={EMBLEM_COLOR[o.id].tint} />
          <g transform={`translate(${386 - 17} ${o.y - 17}) scale(0.85)`}>
            <EmblemShapes id={o.id} />
          </g>
          <text x="420" y={o.y + 5} fontFamily={font} fontSize="14" fontWeight="600" fill="#0C1B33">{o.label}</text>
        </g>
      ))}
    </svg>
  );
}
