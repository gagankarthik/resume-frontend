import Link from 'next/link';
import UsHeatMap from '../product/UsHeatMap';
import SessionCta from './SessionCta';

/**
 * Home hero. A measured grid with short beams of light running along its
 * lines, soft colour drifting underneath, the headline, and the product's own
 * picture — the talent map.
 * All of it is CSS; nothing here runs JavaScript on the client.
 */

const GRID = 56;
/** Which grid lines carry a beam, and when it starts. */
const BEAMS_X = [
  { row: 2, delay: '0s' },
  { row: 5, delay: '-3.2s' },
  { row: 8, delay: '-5.6s' },
];
const BEAMS_Y = [
  { col: 3, delay: '-1.4s' },
  { col: 9, delay: '-4.8s' },
  { col: 15, delay: '-2.6s' },
  { col: 21, delay: '-6.1s' },
];

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* colour, drifting */}
      <div className="hm-drift absolute -left-40 top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-indigo-300/30 blur-[110px]" />
      <div className="hm-drift absolute right-[-12rem] top-[-6rem] h-[30rem] w-[30rem] rounded-full bg-pink-200/40 blur-[110px] [animation-delay:-7s]" />
      <div className="hm-drift absolute left-1/3 top-[14rem] h-[26rem] w-[26rem] rounded-full bg-cyan-200/30 blur-[110px] [animation-delay:-13s]" />

      {/* the grid and its beams */}
      <div className="absolute inset-0">
        <div className="grid-bg-light absolute inset-0" />
        {BEAMS_X.map(b => (
          <span key={b.row} className="grid-beam-x" style={{ top: b.row * GRID, animationDelay: b.delay }} />
        ))}
        {BEAMS_Y.map(b => (
          <span key={b.col} className="grid-beam-y" style={{ left: b.col * GRID, animationDelay: b.delay }} />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-32 sm:pt-40">
      <Backdrop />

      <div className="relative mx-auto max-w-[1200px] px-5 text-center">
        <Link
          href="/talent-map"
          className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-1.5 text-[13px] font-medium text-zinc-700 shadow-[0_1px_2px_rgba(9,9,11,0.05)] backdrop-blur transition-colors hover:border-zinc-300"
        >
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          Introducing the talent heat map
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden className="text-zinc-400 transition-transform group-hover:translate-x-0.5">
            <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <h1 className="mx-auto mt-8 text-zinc-950 max-w-[15ch] text-balance text-[46px] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[80px]">
          Every resume. One map of your market.
        </h1>
        <p className="mx-auto mt-7 max-w-[36rem] text-[17px] leading-[1.6] text-zinc-500 sm:text-[18px]">
          Format resumes to any state template, rank them against a job, and see where the talent works — all from
          the resumes your team already handles.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <SessionCta />
          <Link
            href="/talent-map"
            className="inline-flex h-11 items-center rounded-full border border-zinc-200 bg-white px-6 text-[14.5px] font-medium text-zinc-900 shadow-[0_1px_2px_rgba(9,9,11,0.05)] transition-colors hover:bg-zinc-50"
          >
            Explore the heat map
          </Link>
        </div>
      </div>

      {/* the product's own picture, straight on the page */}
      <div className="relative mx-auto mt-14 max-w-[760px] px-4 sm:px-6">
        <div style={{ aspectRatio: '975 / 560' }}>
          <UsHeatMap tone="vivid" viewBox="0 20 975 560" backdrop={false} />
        </div>
      </div>
    </section>
  );
}
