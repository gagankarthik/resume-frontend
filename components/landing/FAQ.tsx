'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAQ_ITEMS } from '@/lib/site/content';

function Item({ q, a, id, defaultOpen, dark }: { q: string; a: string; id: string; defaultOpen: boolean; dark: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border-b ${dark ? 'border-white/[0.08]' : 'border-tc-line'}`}>
      <h3>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <span className={`text-[17px] font-semibold tracking-[-0.01em] ${dark ? 'text-white' : 'text-tc-ink'}`}>{q}</span>
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
              open
                ? dark ? 'border-white bg-white text-zinc-950' : 'border-tc-azure bg-tc-azure text-white'
                : dark ? 'border-white/15 text-zinc-400 group-hover:text-white' : 'border-tc-line-2 text-tc-muted group-hover:border-tc-faint group-hover:text-tc-ink'
            }`}
            aria-hidden
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
              <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className={`max-w-[40rem] pb-6 pr-12 text-[15.5px] leading-[1.65] ${dark ? 'text-zinc-400' : 'text-tc-muted'}`}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The question list. `limit` shows the first few, for pages that link on to /faq. */
export default function FAQList({ limit, tone = 'light' }: { limit?: number; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark';
  const items = limit ? FAQ_ITEMS.slice(0, limit) : FAQ_ITEMS;
  return (
    <div className={`border-t ${dark ? 'border-white/[0.08]' : 'border-tc-line'}`}>
      {items.map((item, i) => (
        <Item key={item.q} id={`faq-${i}`} q={item.q} a={item.a} defaultOpen={i === 0} dark={dark} />
      ))}
    </div>
  );
}
