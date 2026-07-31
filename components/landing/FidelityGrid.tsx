'use client';

import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const CARDS = [
  {
    title: 'Bullets are copied, not rewritten',
    body: 'No paraphrasing, no merging, no trimming to fit the template.',
  },
  {
    title: 'Checked against the source',
    body: 'Every line matched back to the original before you see it. Gaps are flagged.',
  },
  {
    title: 'Nothing is invented',
    body: 'Contact details and dates are kept only when they appear in the file.',
  },
  {
    title: 'You sign it off',
    body: 'A full editor sits between extraction and download. Nothing exports until you say so.',
  },
];

export default function FidelityGrid() {
  return (
    <section id="controls" className="border-t border-tc-line bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHeading label="Controls" title="A copy is only useful if it is true." />

        {/* Proof: the same bullet, in and out */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 overflow-hidden rounded-xl border border-tc-line"
        >
          <div className="grid md:grid-cols-2">
            <div className="border-b border-tc-line p-6 md:border-b-0 md:border-r">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-tc-faint">
                Source
              </p>
              <p className="text-[14.5px] leading-relaxed text-tc-ink">
                Migrated 14 legacy batch jobs to AWS Step Functions, cutting nightly run
                time from 6 hrs to 47 min.
              </p>
            </div>
            <div className="bg-tc-mint/[0.04] p-6">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-tc-mint">
                <svg width="11" height="11" viewBox="0 0 8 8" fill="none" aria-hidden>
                  <path d="M1 4.2 3 6.2 7 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copy, identical
              </p>
              <p className="text-[14.5px] leading-relaxed text-tc-ink">
                Migrated 14 legacy batch jobs to AWS Step Functions, cutting nightly run
                time from 6 hrs to 47 min.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-tc-line p-6"
            >
              <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-tc-ink">{c.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-tc-muted">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
