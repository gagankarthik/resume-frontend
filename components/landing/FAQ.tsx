'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const QA = [
  {
    q: 'What can I upload?',
    a: 'PDF, Word (.docx, .doc), and plain text, up to 20 MB. Scanned pages are read with OCR.',
  },
  {
    q: 'Does it reword anything?',
    a: 'No. Bullets and descriptions are copied character for character. Only the layout changes.',
  },
  {
    q: 'What if a section is missed?',
    a: 'The record is checked against the original before you see it, and anything missing is flagged at the top of the editor.',
  },
  {
    q: 'Is candidate data stored?',
    a: 'The upload is held in memory for the request and never written to disk. The extracted record stays in your browser until you clear it.',
  },
  {
    q: 'Can one resume go to several states?',
    a: 'Yes. Extract once, then export to any template without re-uploading.',
  },
];

function Item({ q, a, defaultOpen }: { q: string; a: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-tc-line last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-[16px] font-medium text-tc-ink">{q}</span>
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
            open ? 'rotate-45 border-tc-ink bg-tc-ink text-white' : 'border-tc-line text-tc-muted'
          }`}
          aria-hidden
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-xl pb-5 pr-10 text-[14.5px] leading-[1.65] text-tc-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="border-t border-tc-line bg-tc-desk py-20 lg:py-24">
      <div className="mx-auto max-w-[1140px] px-5">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
          <SectionHeading label="FAQ" title="Before you upload." />
          <div className="rounded-xl border border-tc-line bg-white px-6">
            {QA.map((item, i) => (
              <Item key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
