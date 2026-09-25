'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * How three spellings become one company, and a raw title becomes a family —
 * cycling through real normalizer behaviour (see lib/talent/normalize.ts).
 */
const PAIRS: [string, string][] = [
  ['JPMC', 'JPMorgan Chase'],
  ['JP Morgan', 'JPMorgan Chase'],
  ['JPMorgan Chase & Co.', 'JPMorgan Chase'],
  ['Sr. Java Dev', 'Software developers'],
  ['k8s, reactjs, ms sql', 'Kubernetes, React, SQL Server'],
];

export default function NormalizeDemo() {
  const still = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setI(n => (n + 1) % PAIRS.length), 2200);
    return () => clearInterval(id);
  }, [still]);
  const [raw, clean] = PAIRS[i];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
      <div className="h-12 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 px-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={raw}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="truncate pt-3.5 font-mono text-[13px] text-zinc-500"
          >
            {raw}
          </motion.p>
        </AnimatePresence>
      </div>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="text-indigo-500">
        <path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="h-12 overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50 px-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={clean + i}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="truncate pt-3.5 text-[13.5px] font-semibold text-indigo-950"
          >
            {clean}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
