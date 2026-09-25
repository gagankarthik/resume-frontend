'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * The heat map's two modes, side by side with the questions each one answers.
 * The questions are the ones the teams asked for; the frames are passed in
 * from the server so the renders stay static HTML.
 */

const MODES = {
  recruiting: {
    label: 'Recruiting',
    lead: 'Find the pockets of talent you need, then open the people behind them.',
    questions: [
      'Where are the densest pockets of Java developers within 50 miles of our office?',
      'Which employers hold the most data engineers with Snowflake?',
      'Which of these candidates are already in our files?',
    ],
  },
  sales: {
    label: 'Sales',
    lead: 'Rank the companies near you by the skills you place, and spot the white space.',
    questions: [
      'Which companies near us run large teams in the skills we place?',
      'Which of them are not yet our clients?',
      'What is their tech stack, and where do we call?',
    ],
  },
} as const;

type Mode = keyof typeof MODES;

const STYLE = {
  light: {
    tabs: 'border-tc-line bg-white shadow-[0_1px_2px_rgba(12,27,51,0.06)]',
    on: 'bg-tc-ink text-white',
    off: 'text-tc-muted hover:text-tc-ink',
    lead: 'text-tc-ink',
    card: 'border-tc-line bg-white text-tc-ink-2 shadow-[0_1px_2px_rgba(12,27,51,0.04)]',
    icon: 'text-tc-azure',
  },
  dark: {
    tabs: 'border-white/10 bg-white/[0.03]',
    on: 'bg-white text-zinc-950',
    off: 'text-zinc-400 hover:text-white',
    lead: 'text-zinc-200',
    card: 'border-white/[0.08] bg-zinc-900/50 text-zinc-300',
    icon: 'text-indigo-300',
  },
} as const;

export default function HeatModes({
  recruiting,
  sales,
  tone = 'light',
}: {
  recruiting: ReactNode;
  sales: ReactNode;
  tone?: 'light' | 'dark';
}) {
  const [mode, setMode] = useState<Mode>('recruiting');
  const m = MODES[mode];
  const s = STYLE[tone];

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <div>
        <div role="tablist" aria-label="Heat map modes" className={`inline-flex rounded-full border p-1 ${s.tabs}`}>
          {(Object.keys(MODES) as Mode[]).map(k => (
            <button
              key={k}
              role="tab"
              aria-selected={mode === k}
              aria-controls="heat-mode-panel"
              onClick={() => setMode(k)}
              className={`rounded-full px-5 py-2 text-[14px] font-semibold transition-colors ${
                mode === k ? s.on : s.off
              }`}
            >
              {MODES[k].label} mode
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <p className={`mt-7 text-[19px] leading-[1.5] ${s.lead}`}>{m.lead}</p>
            <ul className="mt-6 space-y-3">
              {m.questions.map(q => (
                <li key={q} className={`flex gap-3 rounded-xl border px-4 py-3.5 text-[15px] leading-[1.45] ${s.card}`}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={`mt-0.5 shrink-0 ${s.icon}`} aria-hidden>
                    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m13.2 13.2 3.3 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  {q}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      <div id="heat-mode-panel" role="tabpanel" className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === 'recruiting' ? recruiting : sales}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
