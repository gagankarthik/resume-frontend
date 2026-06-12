'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/* Miniature template previews — each drawn to echo the real DOCX layout. */

const MiniTable = ({ color }: { color: string }) => (
  <div className="border" style={{ borderColor: `${color}55` }}>
    <div className="grid grid-cols-4 gap-px p-px" style={{ background: `${color}30` }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[7px] bg-white" />
      ))}
    </div>
  </div>
);

const Lines = ({ widths, tone = '#11253c' }: { widths: number[]; tone?: string }) => (
  <div className="space-y-[4px]">
    {widths.map((w, i) => (
      <div key={i} className="h-[4px]" style={{ width: `${w}%`, background: `${tone}26` }} />
    ))}
  </div>
);

const OhioMini = () => (
  <div className="space-y-2 p-3">
    <div className="mx-auto h-[7px] w-2/3 bg-[#005ea2]" />
    <div className="flex justify-between">
      <div className="h-[5px] w-1/4 bg-[#005ea2]/70" />
      <div className="h-[5px] w-1/3 bg-[#005ea2]/70" />
    </div>
    <MiniTable color="#005ea2" />
    <Lines widths={[90, 76, 84]} />
  </div>
);

const PennMini = () => (
  <div className="space-y-2 p-3">
    <div className="mx-auto h-[7px] w-2/3 bg-[#002868]" />
    <div className="h-[3px] w-full bg-[#b88400]" />
    <MiniTable color="#002868" />
    <Lines widths={[88, 70, 92]} tone="#002868" />
  </div>
);

const GeorgiaMini = () => (
  <div className="space-y-2 p-3">
    <div className="mx-auto border-b-2 border-[#1a1a1a] pb-[3px]">
      <div className="h-[7px] w-24 bg-[#1a1a1a]" />
    </div>
    <div className="h-[4px] w-1/3 border-b border-[#1a1a1a] bg-[#1a1a1a]/60" />
    <Lines widths={[92, 84, 76, 88]} tone="#1a1a1a" />
    <div className="h-[4px] w-2/5 bg-[#BA0C2F]/70" />
    <Lines widths={[80, 68]} tone="#1a1a1a" />
  </div>
);

const OceanblueMini = () => (
  <div className="space-y-2 p-3">
    <div className="h-[6px] w-1/4 bg-[#0f6fb4]" />
    <div className="mx-auto h-[7px] w-1/2 bg-[#11253c]" />
    <div className="mx-auto h-[4px] w-2/3 bg-[#11253c]/30" />
    <Lines widths={[90, 82, 88, 74]} />
    <div className="h-[4px] w-2/5 bg-[#0f6fb4]/70" />
    <Lines widths={[84, 70]} />
  </div>
);

const FORMATS = [
  {
    code: 'T-01',
    name: 'Ohio',
    accent: '#005ea2',
    Mini: OhioMini,
    specs: ['Education + certification tables', 'VectorVMS requisition №', 'Employment with work periods'],
  },
  {
    code: 'T-02',
    name: 'Pennsylvania',
    accent: '#002868',
    Mini: PennMini,
    specs: ['Commonwealth table layout', 'PeopleFluent requisition №', 'Summary set as bullets'],
  },
  {
    code: 'T-03',
    name: 'Georgia',
    accent: '#BA0C2F',
    Mini: GeorgiaMini,
    specs: ['Full chronological resume', 'Seventeen-section coverage', 'Serif document setting'],
  },
  {
    code: 'T-04',
    name: 'Oceanblue',
    accent: '#0f6fb4',
    Mini: OceanblueMini,
    specs: ['Company letterhead + logo', 'Skills-forward ordering', 'Client presentation ready'],
  },
];

export default function FormatGallery() {
  return (
    <section id="formats" className="paper-grid bg-paper py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink/60">
              <span className="inline-block h-[2px] w-10 bg-signal" />
              Fig. 03 — Output templates
            </p>
            <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
              One record. Four documents.
            </h2>
          </div>
          <p className="max-w-xs font-mono text-[11px] leading-relaxed tracking-[0.06em] text-ink/50">
            THE SAME EXTRACTED RECORD SETS EVERY TEMPLATE — EDIT ONCE, EXPORT ANY.
          </p>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {FORMATS.map((f, i) => (
            <motion.div
              key={f.code}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="lift-block hard-shadow group border-2 border-ink bg-white"
            >
              {/* folder tab */}
              <div className="flex items-center justify-between border-b-2 border-ink px-4 py-2.5">
                <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-ink/55">{f.code}</span>
                <span className="h-2.5 w-2.5 rotate-45 transition-transform group-hover:rotate-[135deg]" style={{ background: f.accent }} />
              </div>

              {/* miniature document */}
              <div className="border-b-2 border-ink bg-paper-deep/60 p-4">
                <div className="mx-auto max-w-[180px] border border-ink/25 bg-white shadow-[3px_3px_0_rgba(17,37,60,0.18)] transition-transform duration-200 group-hover:-translate-y-1.5 group-hover:rotate-[0.6deg]">
                  <f.Mini />
                </div>
              </div>

              {/* spec sheet */}
              <div className="p-4">
                <h3 className="text-lg font-extrabold tracking-tight text-ink">{f.name}</h3>
                <ul className="mt-3 space-y-1.5">
                  {f.specs.map(s => (
                    <li key={s} className="flex items-start gap-2 font-mono text-[10.5px] leading-snug text-ink/65">
                      <span className="mt-[5px] h-[5px] w-[5px] shrink-0" style={{ background: f.accent }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/upload"
            className="lift-block hard-shadow inline-block border-2 border-ink bg-signal px-7 py-3.5 text-[13px] font-extrabold uppercase tracking-wide text-white"
          >
            Convert a resume now
          </Link>
        </div>
      </div>
    </section>
  );
}
