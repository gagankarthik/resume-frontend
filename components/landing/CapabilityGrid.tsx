'use client';

import { motion } from 'framer-motion';

const MODULES = [
  {
    id: 'M-01',
    accent: '#0f6fb4',
    span: 'lg:col-span-3',
    title: 'Verbatim, or not at all',
    body: 'Bullets are copied character for character — never paraphrased, never merged, never cut mid-sentence. What the candidate wrote is what the document says.',
    foot: 'EXACT-COPY EXTRACTION',
  },
  {
    id: 'M-02',
    accent: '#1e7a50',
    span: 'lg:col-span-3',
    title: 'Audited against the source',
    body: 'After extraction, every significant line of the original file is checked against the output. Anything that did not make it through is flagged in the editor before you export.',
    foot: 'COVERAGE REPORT ON EVERY RUN',
  },
  {
    id: 'M-03',
    accent: '#BA0C2F',
    span: 'lg:col-span-2',
    title: 'Grounded fields',
    body: 'Emails, phone numbers, client names — kept only when they exist in the source document. Suspect values are removed and reported.',
    foot: 'NO INVENTED DATA',
  },
  {
    id: 'M-04',
    accent: '#b88400',
    span: 'lg:col-span-2',
    title: 'Hard layouts welcome',
    body: 'Multi-column PDFs, skill matrices, education tables, repeated headers and footers — captured in reading order.',
    foot: 'LAYOUT-AWARE CAPTURE',
  },
  {
    id: 'M-05',
    accent: '#e1591f',
    span: 'lg:col-span-2',
    title: 'Edit before export',
    body: 'A full field editor sits between extraction and download. Review every section, fix anything, then set the template.',
    foot: 'HUMAN SIGN-OFF BUILT IN',
  },
];

const METRICS = [
  { n: '20+', label: 'data sections extracted', color: '#0f6fb4' },
  { n: '4', label: 'output templates', color: '#BA0C2F' },
  { n: '4', label: 'input file types', color: '#1e7a50' },
  { n: '5', label: 'stations on the line', color: '#e1591f' },
];

export default function CapabilityGrid() {
  return (
    <section id="capabilities" className="border-t-2 border-ink bg-paper-deep py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="mb-14">
          <p className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink/60">
            <span className="inline-block h-[2px] w-10 bg-signal" />
            Fig. 04 — Engineering notes
          </p>
          <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
            Built for documents that fight back.
          </h2>
        </div>

        {/* Bento modules */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`lift-block hard-shadow-sm flex flex-col border-2 border-ink bg-paper p-6 ${m.span}`}
              style={{ borderTopColor: m.accent, borderTopWidth: 4 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-ink/50">{m.id}</span>
                <span className="h-2 w-2 rotate-45" style={{ background: m.accent }} />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-ink">{m.title}</h3>
              <p className="mt-2.5 flex-1 text-[14px] leading-relaxed text-ink/70">{m.body}</p>
              <p className="mt-5 border-t-2 border-ink/10 pt-3 font-mono text-[10px] tracking-[0.16em]" style={{ color: m.accent }}>
                {m.foot}
              </p>
            </motion.div>
          ))}

          {/* Privacy module — inverted */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="lift-block hard-shadow-sm flex flex-col border-2 border-ink bg-ink p-6 lg:col-span-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-signal">M-06</span>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-paper">Private by default</h3>
                <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-paper/65">
                  Files are processed in memory and never written to storage. The extracted record
                  lives in your browser until you export it.
                </p>
              </div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-paper/50">
                NO ACCOUNTS · NO RETENTION · NO TRACKING
              </p>
            </div>
          </motion.div>
        </div>

        {/* Metrics strip */}
        <div className="mt-16 grid grid-cols-2 gap-px border-2 border-ink bg-ink sm:grid-cols-4">
          {METRICS.map(m => (
            <div key={m.label} className="group bg-paper px-6 py-7 text-center transition-colors hover:bg-white">
              <p className="text-4xl font-black tracking-tight transition-transform duration-200 group-hover:scale-110" style={{ color: m.color }}>{m.n}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
