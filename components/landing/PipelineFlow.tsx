'use client';

import { motion } from 'framer-motion';

const STATIONS = [
  {
    no: '01',
    name: 'Intake',
    accent: '#4FC3F7',
    body: 'Layout-aware text capture. Tables, multi-column pages, headers and footers — read in document order.',
    spec: 'PDF · DOCX · DOC · TXT',
  },
  {
    no: '02',
    name: 'Extract',
    accent: '#FFC53D',
    body: 'Twenty-plus sections parsed field by field: work history, education, skills, projects, certifications.',
    spec: '20+ SECTIONS',
  },
  {
    no: '03',
    name: 'Validate',
    accent: '#4ADE80',
    body: 'Bullet counts cross-checked against the source. Contact details kept only if they appear in the document.',
    spec: 'LINE-BY-LINE AUDIT',
  },
  {
    no: '04',
    name: 'Format',
    accent: '#FF8A5C',
    body: 'The reviewed record is set into the selected template — tables, headers, and spacing to the letter.',
    spec: 'OH · PA · GA · OB',
  },
  {
    no: '05',
    name: 'Export',
    accent: '#C792EA',
    body: 'A finished Word document, ready for submission. Files are processed in memory — nothing is retained.',
    spec: '.DOCX OUT',
  },
];

export default function PipelineFlow() {
  return (
    <section id="pipeline" className="blueprint-grid relative bg-ink-deep py-24">
      <div className="mx-auto max-w-[1180px] px-5">

        {/* Section heading */}
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-sky-300/70">
              <span className="inline-block h-[2px] w-10 bg-signal" />
              Fig. 02 — Processing line
            </p>
            <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.02em] text-paper sm:text-5xl">
              Five stations between upload and submission-ready.
            </h2>
          </div>
          <p className="max-w-xs font-mono text-[11px] leading-relaxed tracking-[0.06em] text-sky-200/50">
            EVERY DOCUMENT RUNS THE FULL LINE.
            <br />
            NO STATION IS SKIPPED.
          </p>
        </div>

        {/* ── Conveyor track (desktop) ── */}
        <div className="relative mb-14 hidden h-20 lg:block" aria-hidden>
          {/* the moving line */}
          <div className="conveyor absolute left-0 right-0 top-1/2 -translate-y-1/2" />

          {/* traveling document chip */}
          <div className="chip-travel absolute top-1/2 -translate-y-1/2">
            <div className="hard-shadow-signal grid h-10 w-9 place-items-center border-2 border-signal bg-paper">
              <div className="space-y-[3px]">
                <div className="h-[2px] w-4 bg-ink/70" />
                <div className="h-[2px] w-3 bg-ink/50" />
                <div className="h-[2px] w-4 bg-ink/70" />
              </div>
            </div>
          </div>

          {/* station nodes */}
          {STATIONS.map((s, i) => (
            <div
              key={s.no}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${10 + i * 20}%` }}
            >
              <div
                className="station-pulse grid h-11 w-11 rotate-45 place-items-center border-2 bg-ink-deep"
                style={{
                  animationDelay: `${i * 0.45}s`,
                  borderColor: s.accent,
                  ['--pulse-from' as string]: `${s.accent}80`,
                  ['--pulse-to' as string]: `${s.accent}00`,
                }}
              >
                <span className="-rotate-45 font-mono text-[11px] font-semibold text-paper">{s.no}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Station cards ── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STATIONS.map((s, i) => (
            <motion.div
              key={s.no}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.09 }}
              whileHover={{ y: -5 }}
              className="group relative border-2 border-sky-200/25 bg-ink/60 p-5"
              style={{ borderTopColor: s.accent, borderTopWidth: 3 }}
            >
              {/* vertical connector to track (desktop) */}
              <div className="absolute -top-14 left-1/2 hidden h-14 w-px bg-sky-200/20 lg:block" aria-hidden />

              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em]" style={{ color: s.accent }}>
                  STN {s.no}
                </span>
                <span className="h-2 w-2 rotate-45 transition-transform group-hover:scale-150" style={{ background: s.accent }} />
              </div>

              <h3 className="text-lg font-extrabold uppercase tracking-wide text-paper">{s.name}</h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-sky-100/65">{s.body}</p>

              <p className="mt-5 border-t border-sky-200/15 pt-3 font-mono text-[10px] tracking-[0.14em]" style={{ color: `${s.accent}B3` }}>
                {s.spec}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
