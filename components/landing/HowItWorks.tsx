'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import {
  IconDownload,
  IconEdit,
  IconRead,
  IconVerified,
  IconPage,
} from '@/components/ui/icons';

/* ── Stage visuals ───────────────────────────────────────────────────────── */

const Bars = ({ widths, tone = 'rgba(11,27,51,0.13)' }: { widths: number[]; tone?: string }) => (
  <div className="space-y-[5px]">
    {widths.map((w, i) => (
      <div key={i} className="h-[5px] rounded-full" style={{ width: `${w}%`, background: tone }} />
    ))}
  </div>
);

function StageRead() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-tc-line bg-white p-5">
      <div className="grid grid-cols-2 gap-5">
        {[0, 1].map(col => (
          <div key={col} className="space-y-3.5">
            <div className="h-[7px] w-2/3 rounded-full bg-tc-ink/25" />
            <Bars widths={col ? [96, 82, 90, 70] : [88, 94, 76, 92]} />
            <div className="h-[7px] w-1/2 rounded-full bg-tc-ink/25" />
            <Bars widths={col ? [84, 92, 68] : [90, 78, 86]} />
          </div>
        ))}
      </div>
      <motion.div
        aria-hidden
        initial={{ top: '-10%' }}
        animate={{ top: '106%' }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-x-0 h-9"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(31,111,235,0.12), transparent)' }}
      />
    </div>
  );
}

function StageExtract() {
  const fields = [
    ['Contact', '9 fields'],
    ['Summary', '1 block'],
    ['Skills', '7 groups'],
    ['Work history', '6 roles · 38 bullets'],
    ['Education', '2 degrees'],
    ['Certifications', '3 found'],
  ];
  return (
    <div className="space-y-1.5 rounded-lg border border-tc-line bg-white p-4">
      {fields.map(([name, count], i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="flex items-center justify-between rounded-md bg-tc-desk/70 px-3 py-2.5"
        >
          <span className="text-[13px] font-medium text-tc-ink">{name}</span>
          <span className="font-mono text-[11px] text-tc-faint">{count}</span>
        </motion.div>
      ))}
    </div>
  );
}

function StageCheck() {
  const rows = [
    ['Bullets, roles 1–6', '38 of 38', true],
    ['Dates', 'all matched', true],
    ['Email, phone', 'found in source', true],
    ['Certification 3', 'not in output', false],
  ] as const;
  return (
    <div className="space-y-1.5 rounded-lg border border-tc-line bg-white p-4">
      {rows.map(([label, value, ok], i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
          className="flex items-center gap-3 rounded-md px-3 py-2.5"
          style={{ background: ok ? 'rgba(15,158,114,0.06)' : 'rgba(201,122,6,0.09)' }}
        >
          <span
            className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-white"
            style={{ background: ok ? 'var(--color-tc-mint)' : 'var(--color-tc-amber)' }}
          >
            {ok ? (
              <svg width="9" height="9" viewBox="0 0 8 8" fill="none" aria-hidden>
                <path d="M1 4.2 3 6.2 7 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="text-[9px] font-bold leading-none">!</span>
            )}
          </span>
          <span className="flex-1 text-[13px] text-tc-ink">{label}</span>
          <span className="font-mono text-[11px] text-tc-muted">{value}</span>
        </motion.div>
      ))}
    </div>
  );
}

function StageReview() {
  return (
    <div className="rounded-lg border border-tc-line bg-white p-4">
      <div className="mb-4 flex items-center gap-2 rounded-md border border-tc-amber/25 bg-tc-amber/[0.07] px-3 py-2.5">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-tc-amber text-[9px] font-bold leading-none text-white">
          !
        </span>
        <p className="text-[12.5px] text-tc-ink">1 item needs review</p>
      </div>
      <div className="space-y-3.5">
        {['Job title', 'Start date', 'Certification name'].map((label, i) => (
          <div key={label}>
            <p className="mb-1.5 text-[11px] font-medium text-tc-faint">{label}</p>
            <div
              className={`h-9 rounded-lg border bg-white px-3 ${
                i === 2 ? 'border-tc-amber/50 shadow-[0_0_0_3px_rgba(201,122,6,0.10)]' : 'border-tc-line'
              }`}
            >
              <div className="flex h-full items-center">
                <span className="h-[5px] rounded-full bg-tc-ink/[0.14]" style={{ width: `${[52, 30, 44][i]}%` }} />
                {i === 2 && <span className="ml-1 h-4 w-px animate-pulse bg-tc-azure" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StageExport() {
  return (
    <div className="rounded-lg border border-tc-line bg-white p-4">
      <div className="grid grid-cols-2 gap-2.5">
        {['Ohio', 'Pennsylvania', 'Georgia', 'Oceanblue'].map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.28 }}
            className="flex items-center justify-between rounded-lg border border-tc-line px-3 py-3"
          >
            <span className="flex items-center gap-2.5">
              <span
                className="h-6 w-5 rounded-[3px]"
                style={{ background: ['#1F6FEB', '#002868', '#BA0C2F', '#1F6FEB'][i] }}
              />
              <span className="text-[13px] font-medium text-tc-ink">{name}</span>
            </span>
            <span className="font-mono text-[10.5px] text-tc-faint">.docx</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Steps ───────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    title: 'Read the file',
    Icon: IconPage,
    body: 'Two-column PDFs, skill matrices, education tables, headers repeated on every page, captured in the order a person would read them.',
    meta: 'PDF · DOCX · DOC · TXT',
    Stage: StageRead,
  },
  {
    title: 'Extract the sections',
    Icon: IconRead,
    body: 'Twenty-plus sections separated into fields. Bullets are copied character for character, never shortened, merged, or reworded.',
    meta: '20+ sections, verbatim',
    Stage: StageExtract,
  },
  {
    title: 'Check against the source',
    Icon: IconVerified,
    body: 'Every meaningful line of the original is matched back to the record and bullet counts are compared role by role. Gaps are flagged, not hidden.',
    meta: 'Coverage report on every run',
    Stage: StageCheck,
  },
  {
    title: 'Review and fix',
    Icon: IconEdit,
    body: 'A full editor sits between extraction and download, with flagged items at the top of the list. Nothing is written until you say so.',
    meta: 'Section-by-section editor',
    Stage: StageReview,
  },
  {
    title: 'Export the document',
    Icon: IconDownload,
    body: 'The reviewed record is set into the template you pick: borders, heading order, fonts, and spacing to the letter. Export again for a second agency from the same record.',
    meta: 'One record, any template',
    Stage: StageExport,
  },
];

const DWELL = 6000;

export default function HowItWorks() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reduced) return;
    const id = setTimeout(() => setActive(i => (i + 1) % STEPS.length), DWELL);
    return () => clearTimeout(id);
  }, [active, auto, reduced]);

  const step = STEPS[active];
  const Stage = step.Stage;

  return (
    <section id="how" className="border-t border-tc-line bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHeading label="How it works" title="Five passes, every document." />

        {/* Step rail */}
        <div
          className="mt-10 grid gap-2 sm:grid-cols-3 lg:grid-cols-5"
          role="tablist"
          aria-label="Processing steps"
        >
          {STEPS.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.title}
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setAuto(false);
                  setActive(i);
                }}
                className={`group relative overflow-hidden rounded-lg border px-3.5 py-3 text-left transition-colors ${
                  on
                    ? 'border-tc-line-2 bg-white shadow-[0_1px_2px_rgba(11,27,51,0.06)]'
                    : 'border-transparent bg-tc-desk hover:bg-tc-desk-2'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <s.Icon size={16} className={on ? 'text-tc-azure' : 'text-tc-faint'} />
                  <span
                    className={`text-[13.5px] font-medium ${on ? 'text-tc-ink' : 'text-tc-muted'}`}
                  >
                    {s.title}
                  </span>
                </span>

                {/* Dwell indicator */}
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent">
                  {on && (
                    <motion.span
                      key={`${active}-${auto}`}
                      className="block h-full bg-tc-azure"
                      initial={{ width: auto && !reduced ? '0%' : '100%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: auto && !reduced ? DWELL / 1000 : 0.25, ease: 'linear' }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="mt-4 overflow-hidden rounded-xl border border-tc-line bg-tc-desk/50">
          <div className="grid items-stretch lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="flex flex-col justify-center border-b border-tc-line bg-white p-7 lg:border-b-0 lg:border-r lg:p-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-mono text-[11px] text-tc-faint">
                    {String(active + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2.5 text-[24px] font-semibold tracking-[-0.025em] text-tc-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3.5 text-[15px] leading-[1.65] text-tc-muted">{step.body}</p>
                  <p className="mt-6 inline-flex rounded-md bg-tc-desk px-2.5 py-1.5 font-mono text-[11.5px] text-tc-muted">
                    {step.meta}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-5 sm:p-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Stage />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
