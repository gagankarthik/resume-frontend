/**
 * Template emblems.
 *
 * Each template gets a mark drawn from something its state is known by —
 * not its seal or flag, which belong to the state. Ohio's swallowtail
 * pennant, Pennsylvania's keystone, Georgia's peach, and a swell of water
 * for Oceanblue's own house style. All four share one 40×40 grid, a 1.6
 * stroke, and the same inset so they sit as a set.
 */

export type TemplateId = 'ohio' | 'pennsylvania' | 'georgia' | 'oceanblue';

export const EMBLEM_COLOR: Record<TemplateId, { main: string; second: string; tint: string }> = {
  ohio: { main: '#B4232F', second: '#2A45D8', tint: '#FBEDEE' },
  pennsylvania: { main: '#0F2A6B', second: '#C08A00', tint: '#EEF1F9' },
  georgia: { main: '#E0682A', second: '#2F8F5B', tint: '#FDF0E8' },
  oceanblue: { main: '#2A45D8', second: '#1AA3C8', tint: '#EDF0FD' },
};

function Ohio() {
  const c = EMBLEM_COLOR.ohio;
  return (
    <>
      <path d="M9 7v27" stroke={c.main} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 9h21l-6 7 6 7H10V9Z" fill={c.main} />
      <circle cx="16.5" cy="16" r="3.2" fill="#fff" />
      <circle cx="16.5" cy="16" r="1.4" fill={c.main} />
    </>
  );
}

function Pennsylvania() {
  const c = EMBLEM_COLOR.pennsylvania;
  return (
    <>
      <path d="M8 9h24l-5 23H13L8 9Z" fill={c.main} />
      <path d="M11.5 12.5h17l-3.6 16.5h-9.8L11.5 12.5Z" fill="none" stroke={c.second} strokeWidth="1.4" />
      <path d="M20 16v9" stroke={c.second} strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

function Georgia() {
  const c = EMBLEM_COLOR.georgia;
  return (
    <>
      <path d="M20 12.5c-1.2-2.8-3.8-4.3-7-4.2 0 3.2 2 5.6 5.2 6" fill={c.second} />
      <path d="M20 12.5c4.4-3.2 12 0 12 8.2C32 27.6 26.8 33 20 33S8 27.6 8 20.7c0-8.2 7.6-11.4 12-8.2Z" fill={c.main} />
      <path d="M20 13.5c-1.8 4.6-1.8 10.4 0 19" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <ellipse cx="14" cy="19.5" rx="2" ry="3.2" fill="#fff" fillOpacity=".25" transform="rotate(20 14 19.5)" />
    </>
  );
}

function Oceanblue() {
  const c = EMBLEM_COLOR.oceanblue;
  return (
    <>
      <path d="M7 15c3.3 0 3.3-3 6.5-3s3.3 3 6.5 3 3.3-3 6.5-3 3.3 3 6.5 3" stroke={c.second} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M7 22c3.3 0 3.3-3 6.5-3s3.3 3 6.5 3 3.3-3 6.5-3 3.3 3 6.5 3" stroke={c.main} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M7 29c3.3 0 3.3-3 6.5-3s3.3 3 6.5 3 3.3-3 6.5-3 3.3 3 6.5 3" stroke={c.main} strokeWidth="2.4" strokeLinecap="round" fill="none" strokeOpacity=".45" />
    </>
  );
}

const DRAW: Record<TemplateId, () => React.ReactElement> = {
  ohio: Ohio,
  pennsylvania: Pennsylvania,
  georgia: Georgia,
  oceanblue: Oceanblue,
};

/** The emblem's shapes alone, on the 40×40 grid, for drawing inside another SVG. */
export function EmblemShapes({ id }: { id: TemplateId }) {
  const Draw = DRAW[id];
  return <Draw />;
}

/** The bare emblem, at icon size. */
export function EmblemGlyph({ id, size = 40, className }: { id: TemplateId; size?: number; className?: string }) {
  const Draw = DRAW[id];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={className}>
      <Draw />
    </svg>
  );
}

/** The emblem on its tinted disc — the form used on cards and in the menu. */
export function Emblem({ id, size = 56, className = '' }: { id: TemplateId; size?: number; className?: string }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full ${className}`}
      style={{ width: size, height: size, background: EMBLEM_COLOR[id].tint }}
      aria-hidden
    >
      <EmblemGlyph id={id} size={Math.round(size * 0.66)} />
    </span>
  );
}
