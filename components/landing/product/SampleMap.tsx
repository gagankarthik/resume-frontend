import UsHeatMap from './UsHeatMap';
import { US_CITIES, type UsCity } from '@/lib/site/us-map';

/**
 * The heat map as a picture of sample data — no app chrome, just the map,
 * a few labelled hotspots and a legend. Positions are real; counts are a
 * labelled sample.
 */

type Label = { city: UsCity; name: string; count: number; side?: 'left' | 'right' };

export default function SampleMap({
  viewBox = { x: 0, y: 0, w: 975, h: 610 },
  labels = [],
  ring,
  animate = true,
  caption,
  sizeScale = 1,
}: {
  sizeScale?: number;
  viewBox?: { x: number; y: number; w: number; h: number };
  labels?: Label[];
  ring?: { city: UsCity; r: number };
  animate?: boolean;
  caption?: string;
}) {
  const pos = (c: UsCity) => ({
    left: ((US_CITIES[c][0] - viewBox.x) / viewBox.w) * 100,
    top: ((US_CITIES[c][1] - viewBox.y) / viewBox.h) * 100,
  });

  return (
    <figure className="relative overflow-hidden rounded-[24px] border border-tc-line bg-[#EEF2F7]" style={{ aspectRatio: `${viewBox.w} / ${viewBox.h}` }}>
      <UsHeatMap
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        animate={animate}
        radiusAround={ring}
        sizeScale={sizeScale}
      />

      {labels.map((l, i) => {
        const p = pos(l.city);
        const right = l.side !== 'left';
        return (
          <div
            key={l.name}
            className={`absolute hidden items-center gap-2 sm:flex ${animate ? 'uh-rise' : ''}`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              transform: right ? 'translate(14px, -50%)' : 'translate(calc(-100% - 14px), -50%)',
              animationDelay: `${1.2 + i * 0.15}s`,
            }}
          >
            <span className="whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] shadow-[0_6px_18px_-8px_rgba(12,27,51,0.35)] ring-1 ring-tc-line">
              <strong className="font-semibold text-tc-ink">{l.name}</strong>
              <span className="ml-1.5 tabular-nums text-tc-muted">{l.count}</span>
            </span>
          </div>
        );
      })}

      <figcaption className="absolute bottom-3 left-3 flex items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 text-[11.5px] text-tc-muted ring-1 ring-tc-line">
        <span className="flex items-center gap-1.5">
          Fewer
          <span className="h-1.5 w-14 rounded-full bg-[linear-gradient(90deg,#7ED3EA,#1AA3C8,#2A45D8,#5B2BB5,#B4237A)]" />
          More
        </span>
        {caption && (
          <>
            <span className="h-3 w-px bg-tc-line-2" />
            {caption}
          </>
        )}
      </figcaption>
    </figure>
  );
}
