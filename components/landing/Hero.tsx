'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Annotation chips called out from the source document, drafting-style.
const CALLOUTS = [
  { label: 'WORK HISTORY', detail: '6 roles · 38 bullets', top: '18%', delay: 0.15, color: '#0f6fb4' },
  { label: 'EDUCATION', detail: 'BS · MS', top: '40%', delay: 0.3, color: '#b88400' },
  { label: 'TECHNICAL SKILLS', detail: '7 categories', top: '62%', delay: 0.45, color: '#1e7a50' },
  { label: 'CERTIFICATIONS', detail: '3 found', top: '84%', delay: 0.6, color: '#BA0C2F' },
];

const SHEET_LINES = [92, 60, 0, 78, 95, 88, 70, 0, 84, 91, 64, 0, 80, 73];

export default function Hero() {
  return (
    <section className="paper-grid relative overflow-hidden bg-paper">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">

        {/* ── Copy ── */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink/60"
          >
            <span className="inline-block h-[2px] w-10 bg-signal" />
            Document processing · State submissions
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-[42px] font-black leading-[1.02] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[68px]"
          >
            Every resume,
            <br />
            <span className="relative inline-block">
              rebuilt to spec.
              <span className="absolute -bottom-1 left-0 h-[6px] w-full bg-signal" aria-hidden />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink/75"
          >
            ResumeKit reads any resume — PDF, Word, or plain text — extracts twenty-plus
            sections field by field, audits the result line by line against the source,
            and produces submission-ready documents in four formats.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/upload"
              className="lift-block hard-shadow border-2 border-ink bg-ink px-7 py-4 text-[14px] font-extrabold uppercase tracking-wide text-paper"
            >
              Put a resume on the line
            </Link>
            <a
              href="#pipeline"
              className="border-b-2 border-ink/30 pb-0.5 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-ink/70 transition-colors hover:border-signal hover:text-ink"
            >
              See how the line works ↓
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-ink/15 pt-5 font-mono text-[11px] tracking-[0.1em] text-ink/55"
          >
            <span>IN — PDF · DOCX · DOC · TXT</span>
            <span className="text-signal">→</span>
            <span>OUT — OHIO · PENNSYLVANIA · GEORGIA · OCEANBLUE</span>
          </motion.div>
        </div>

        {/* ── Annotated source document ── */}
        <div className="relative mx-auto hidden w-full max-w-[460px] sm:block">
          <div className="tick-frame">
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -1.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hard-shadow relative mr-24 border-2 border-ink bg-white p-6"
              style={{ aspectRatio: '8.5 / 10.5' }}
            >
              {/* Sheet header */}
              <div className="mb-1 h-4 w-2/3 bg-ink" />
              <div className="mb-4 h-2 w-1/2 bg-ink/30" />

              {/* Sheet body skeleton */}
              <div className="space-y-[7px]">
                {SHEET_LINES.map((w, i) =>
                  w === 0 ? (
                    <div key={i} className="!mt-3 mb-1 h-[3px] w-1/3 bg-process/70" />
                  ) : (
                    <div key={i} className="h-[6px] bg-ink/15" style={{ width: `${w}%` }} />
                  ),
                )}
              </div>

              {/* Figure stamp */}
              <div className="absolute bottom-3 left-6 font-mono text-[9px] tracking-[0.18em] text-ink/40">
                SOURCE DOCUMENT — 2 PP.
              </div>
            </motion.div>

            {/* Callout chips with leader lines */}
            {CALLOUTS.map(c => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.55 + c.delay }}
                className="absolute right-0 flex items-center"
                style={{ top: c.top }}
              >
                <div
                  className="h-[2px] w-10 shrink-0"
                  style={{ backgroundImage: `repeating-linear-gradient(90deg, ${c.color} 0 6px, transparent 6px 12px)` }}
                />
                <div
                  className="drift-y hard-shadow-sm border-2 border-ink bg-paper px-3 py-2"
                  style={{ animationDelay: `${c.delay}s`, borderLeftColor: c.color, borderLeftWidth: 4 }}
                >
                  <p className="font-mono text-[9px] font-semibold tracking-[0.14em]" style={{ color: c.color }}>{c.label}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-ink/70">{c.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-6 text-center font-mono text-[10px] tracking-[0.18em] text-ink/45">
            FIG. 01 — SOURCE DOCUMENT, ANNOTATED DURING EXTRACTION
          </p>
        </div>
      </div>
    </section>
  );
}
