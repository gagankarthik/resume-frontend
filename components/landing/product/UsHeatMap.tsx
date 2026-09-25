import { US_BORDERS, US_CITIES, US_NATION, type UsCity } from '@/lib/site/us-map';

/**
 * The talent map, drawn: real US outline and state lines, heat pooled over
 * metros, and a bubble per employer site. Values are an illustrative sample;
 * the shapes and positions are real. Animations are CSS only and stop under
 * reduced motion (see globals.css).
 */

/** An illustrative spread across the country: every region carries some talent. */
export const HEAT: [UsCity, number][] = [
  ['newyork', 0.8], ['boston', 0.5], ['philadelphia', 0.55], ['washington', 0.55], ['hartford', 0.28],
  ['buffalo', 0.25], ['portlandme', 0.18], ['pittsburgh', 0.38], ['columbus', 0.5], ['cleveland', 0.38],
  ['cincinnati', 0.34], ['detroit', 0.42], ['chicago', 0.72], ['milwaukee', 0.3], ['indianapolis', 0.32],
  ['minneapolis', 0.45], ['desmoines', 0.22], ['fargo', 0.14], ['siouxfalls', 0.15], ['omaha', 0.24],
  ['kansascity', 0.32], ['stlouis', 0.34], ['charlotte', 0.46], ['raleigh', 0.44], ['richmond', 0.28],
  ['atlanta', 0.66], ['nashville', 0.4], ['birmingham', 0.24], ['memphis', 0.22], ['jackson', 0.14],
  ['neworleans', 0.24], ['miami', 0.52], ['orlando', 0.4], ['tampa', 0.36], ['louisville', 0.22],
  ['charleston', 0.14], ['dallas', 0.7], ['houston', 0.62], ['austin', 0.5], ['sanantonio', 0.34],
  ['oklahomacity', 0.24], ['littlerock', 0.16], ['denver', 0.52], ['cheyenne', 0.12], ['saltlake', 0.36],
  ['boise', 0.2], ['billings', 0.12], ['albuquerque', 0.22], ['phoenix', 0.52], ['lasvegas', 0.3],
  ['losangeles', 0.78], ['sandiego', 0.44], ['sanfrancisco', 0.74], ['sacramento', 0.3],
  ['portland', 0.4], ['seattle', 0.64], ['anchorage', 0.16], ['honolulu', 0.18],
];

/** Employer bubbles: [city, dx, dy, head count]. Offsets fan out firms in one metro. */
export const BUBBLES: [UsCity, number, number, number][] = [
  ['newyork', 0, 0, 38], ['newyork', 8, 7, 20], ['boston', 0, 0, 18], ['philadelphia', 0, 0, 16],
  ['washington', 0, 0, 20], ['pittsburgh', 0, 0, 10], ['columbus', 0, 0, 16], ['cleveland', 0, 0, 11],
  ['detroit', 0, 0, 13], ['chicago', 0, 0, 30], ['chicago', -8, 7, 14], ['minneapolis', 0, 0, 14],
  ['kansascity', 0, 0, 10], ['stlouis', 0, 0, 10], ['charlotte', 0, 0, 14], ['raleigh', 0, 0, 13],
  ['atlanta', 0, 0, 24], ['nashville', 0, 0, 12], ['miami', 0, 0, 17], ['orlando', 0, 0, 11],
  ['dallas', 0, 0, 28], ['houston', 0, 0, 22], ['austin', 0, 0, 16], ['denver', 0, 0, 17],
  ['saltlake', 0, 0, 11], ['phoenix', 0, 0, 17], ['losangeles', 0, 0, 32], ['sandiego', 0, 0, 13],
  ['sanfrancisco', 0, 0, 30], ['portland', 0, 0, 12], ['seattle', 0, 0, 24], ['honolulu', 0, 0, 7],
  ['anchorage', 0, 0, 6],
];
export const bubbleR = (n: number) => 3 + Math.sqrt(n) * 1.2;

/**
 * Colourways. `light` sits on white; `vivid` is the saturated spectrum for the
 * home page; `glow` is drawn in light on a coloured card.
 */
const TONES = {
  light: {
    bg: '#EEF2F7', nation: '#FBFCFE', nationStroke: '#CBD5E3', borders: '#DCE3EC', blend: 'multiply',
    hot: ['#B4237A', '#5B2BB5', '#2A45D8', '#1AA3C8', '#7ED3EA'], soft: ['#2A45D8', '#1AA3C8', '#7ED3EA'],
    bubble: '#2A45D8', bubbleStroke: '#fff',
  },
  vivid: {
    bg: '#F4F2FF', nation: '#FFFFFF', nationStroke: '#D9D4F5', borders: '#ECE9FA', blend: 'multiply',
    hot: ['#F97316', '#EC4899', '#8B5CF6', '#3B82F6', '#22D3EE'], soft: ['#8B5CF6', '#3B82F6', '#22D3EE'],
    bubble: '#4F46E5', bubbleStroke: '#fff',
  },
  night: {
    bg: 'transparent', nation: '#18181B', nationStroke: '#3F3F46', borders: '#27272A', blend: 'screen',
    hot: ['#F9A8D4', '#C084FC', '#818CF8', '#60A5FA', '#22D3EE'], soft: ['#818CF8', '#60A5FA', '#22D3EE'],
    bubble: '#FAFAFA', bubbleStroke: 'rgba(9,9,11,0.8)',
  },
  glow: {
    bg: 'transparent', nation: 'rgba(255,255,255,0.08)', nationStroke: 'rgba(255,255,255,0.45)', borders: 'rgba(255,255,255,0.16)', blend: 'screen',
    hot: ['#FFFFFF', '#FDE68A', '#F9A8D4', '#C4B5FD', '#A5F3FC'], soft: ['#F9A8D4', '#C4B5FD', '#A5F3FC'],
    bubble: '#FFFFFF', bubbleStroke: 'rgba(255,255,255,0.35)',
  },
} as const;

export type MapTone = keyof typeof TONES;

export default function UsHeatMap({
  viewBox = '0 0 975 610',
  radiusAround,
  animate = true,
  sizeScale = 1,
  tone = 'light',
  backdrop = true,
  className = '',
}: {
  /** Paint the sea behind the country; off when the map sits straight on the page. */
  backdrop?: boolean;
  /** Shrinks heat and bubbles for zoomed-in views, where map units are larger on screen. */
  sizeScale?: number;
  viewBox?: string;
  /** Draw a dashed distance ring (in map units) around a city. */
  radiusAround?: { city: UsCity; r: number };
  animate?: boolean;
  tone?: MapTone;
  className?: string;
}) {
  const c = TONES[tone];
  const hot = `uh-heat-${tone}`;
  const soft = `uh-soft-${tone}`;
  return (
    <svg viewBox={viewBox} preserveAspectRatio={backdrop ? 'xMidYMid slice' : 'xMidYMid meet'} className={`block h-full w-full overflow-visible ${className}`} aria-hidden>
      <defs>
        <radialGradient id={hot}>
          <stop offset="0" stopColor={c.hot[0]} stopOpacity="0.95" />
          <stop offset="0.22" stopColor={c.hot[1]} stopOpacity="0.8" />
          <stop offset="0.45" stopColor={c.hot[2]} stopOpacity="0.55" />
          <stop offset="0.7" stopColor={c.hot[3]} stopOpacity="0.25" />
          <stop offset="1" stopColor={c.hot[4]} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={soft}>
          <stop offset="0" stopColor={c.soft[0]} stopOpacity="0.6" />
          <stop offset="0.5" stopColor={c.soft[1]} stopOpacity="0.22" />
          <stop offset="1" stopColor={c.soft[2]} stopOpacity="0" />
        </radialGradient>
        <filter id={`uh-shadow-${tone}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0C1B33" floodOpacity={tone === 'glow' ? 0 : 0.22} />
        </filter>
      </defs>

      {backdrop && <rect x="-200" y="-200" width="1400" height="1000" fill={c.bg} />}
      <path d={US_NATION} fill={c.nation} stroke={c.nationStroke} strokeWidth="1" />
      <path d={US_BORDERS} fill="none" stroke={c.borders} strokeWidth="0.8" />

      {/* heat */}
      <g style={{ mixBlendMode: c.blend }}>
        {HEAT.map(([city, w], i) => {
          const [x, y] = US_CITIES[city];
          const r = (14 + w * 34) * sizeScale;
          return (
            <circle
              key={city}
              cx={x}
              cy={y}
              r={r}
              fill={w > 0.45 ? `url(#${hot})` : `url(#${soft})`}
              opacity={0.4 + w * 0.6}
              className={animate ? 'uh-fade' : undefined}
              style={animate ? { animationDelay: `${120 + i * 25}ms` } : undefined}
            />
          );
        })}
      </g>

      {radiusAround && (
        <circle
          cx={US_CITIES[radiusAround.city][0]}
          cy={US_CITIES[radiusAround.city][1]}
          r={radiusAround.r}
          fill={c.bubble}
          fillOpacity="0.05"
          stroke={c.bubble}
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
      )}

      {/* employer sites */}
      <g filter={`url(#uh-shadow-${tone})`}>
        {BUBBLES.map(([city, dx, dy, n], i) => {
          const [x, y] = US_CITIES[city];
          return (
            <circle
              key={`${city}-${i}`}
              cx={x + dx}
              cy={y + dy}
              r={bubbleR(n) * sizeScale}
              fill={c.bubble}
              fillOpacity={tone === 'glow' ? 0.85 : 0.92}
              stroke={c.bubbleStroke}
              strokeWidth={1.6 * Math.max(sizeScale, 0.6)}
              className={animate ? 'uh-pop' : undefined}
              style={animate ? { animationDelay: `${500 + i * 35}ms` } : undefined}
            />
          );
        })}
      </g>
    </svg>
  );
}