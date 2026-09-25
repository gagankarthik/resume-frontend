/**
 * Spot illustrations for the five passes.
 *
 * Drawn on a 44×44 grid in two tones — ink for structure, a pale azure fill
 * for the sheet — with the same page rectangle the icon set is built from.
 * Printer's cyan marks the thing that pass does to the page.
 */

type GlyphProps = { size?: number; className?: string };

const INK = '#0C1B33';
const FILL = '#E8ECFC';
const CYAN = '#1AA3C8';

function Frame({ size = 44, className, children }: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

/* A page with a reading band passing over it. */
export function GlyphRead(p: GlyphProps) {
  return (
    <Frame {...p}>
      <rect x="10" y="5" width="24" height="32" rx="3.5" fill={FILL} stroke={INK} strokeWidth="1.5" />
      <path d="M15 12h9M15 16.5h14M15 21h12M15 30h10" stroke={INK} strokeWidth="1.5" opacity=".45" />
      <rect x="6" y="23.5" width="32" height="4.5" rx="1.5" fill={CYAN} opacity=".22" />
      <path d="M6 25.75h32" stroke={CYAN} strokeWidth="1.5" />
    </Frame>
  );
}

/* Fields lifted off the page and set out as labelled parts. */
export function GlyphExtract(p: GlyphProps) {
  return (
    <Frame {...p}>
      <rect x="4" y="7" width="20" height="28" rx="3" fill={FILL} stroke={INK} strokeWidth="1.5" />
      <path d="M8.5 13h8M8.5 18h11M8.5 23h9" stroke={INK} strokeWidth="1.5" opacity=".45" />
      <path d="M19.5 18h7.5M17.5 23h9.5" stroke={CYAN} strokeWidth="1.3" strokeDasharray="1.5 2" />
      <rect x="28" y="9" width="12" height="6" rx="2" stroke={INK} strokeWidth="1.5" />
      <rect x="28" y="16" width="12" height="6" rx="2" fill={CYAN} fillOpacity=".15" stroke={CYAN} strokeWidth="1.5" />
      <rect x="28" y="23" width="12" height="6" rx="2" fill={CYAN} fillOpacity=".15" stroke={CYAN} strokeWidth="1.5" />
      <rect x="28" y="30" width="12" height="6" rx="2" stroke={INK} strokeWidth="1.5" />
    </Frame>
  );
}

/* The copy laid over the source, registered, with a pass mark. */
export function GlyphCheck(p: GlyphProps) {
  return (
    <Frame {...p}>
      <rect x="5" y="5" width="21" height="28" rx="3" stroke={INK} strokeWidth="1.5" strokeDasharray="2.5 2.5" opacity=".5" />
      <rect x="12" y="10" width="21" height="28" rx="3" fill={FILL} stroke={INK} strokeWidth="1.5" />
      <path d="M17 17h11M17 21.5h8" stroke={INK} strokeWidth="1.5" opacity=".45" />
      <circle cx="32" cy="32" r="7" fill="#fff" stroke={CYAN} strokeWidth="1.5" />
      <path d="m28.8 32.2 2.2 2.2 4-4.4" stroke={CYAN} strokeWidth="1.6" />
    </Frame>
  );
}

/* A page open for correction: one line flagged, a pen at it. */
export function GlyphReview(p: GlyphProps) {
  return (
    <Frame {...p}>
      <rect x="7" y="5" width="24" height="32" rx="3.5" fill={FILL} stroke={INK} strokeWidth="1.5" />
      <path d="M12 12h13M12 16.5h10" stroke={INK} strokeWidth="1.5" opacity=".45" />
      <rect x="10" y="20" width="18" height="6" rx="1.5" fill={CYAN} fillOpacity=".15" stroke={CYAN} strokeWidth="1.3" />
      <path d="M12 31h8" stroke={INK} strokeWidth="1.5" opacity=".45" />
      <path d="m38.5 19-9.8 9.8-3.4 1 1-3.4 9.8-9.8a1.7 1.7 0 0 1 2.4 2.4Z" fill="#fff" stroke={INK} strokeWidth="1.5" />
    </Frame>
  );
}

/* Four documents fanned out from one record. */
export function GlyphExport(p: GlyphProps) {
  return (
    <Frame {...p}>
      <rect x="4" y="12" width="17" height="23" rx="2.5" fill="#fff" stroke={INK} strokeWidth="1.3" opacity=".55" />
      <rect x="10" y="9" width="17" height="23" rx="2.5" fill="#fff" stroke={INK} strokeWidth="1.3" opacity=".75" />
      <rect x="17" y="6" width="17" height="23" rx="2.5" fill="#fff" stroke={INK} strokeWidth="1.4" />
      <rect x="23" y="13" width="17" height="23" rx="2.5" fill={FILL} stroke={INK} strokeWidth="1.5" />
      <path d="M23 17.5h17" stroke={CYAN} strokeWidth="1.5" />
      <path d="M27 22h9M27 26h7" stroke={INK} strokeWidth="1.5" opacity=".45" />
      <path d="M31.5 29.5v4m0 0-2-2m2 2 2-2" stroke={INK} strokeWidth="1.4" />
    </Frame>
  );
}
