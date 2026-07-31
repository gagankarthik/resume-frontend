'use client';

import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { TEMPLATES, TemplateRowMark } from './templates';

export default function FormatGallery() {
  return (
    <section id="templates" className="border-t border-tc-line bg-tc-desk py-20 lg:py-24">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHeading label="Templates" title="One record, four documents." />

        <div className="mt-12 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((tpl, i) => {
            return (
              <motion.article
                key={tpl.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="tc-card tc-card-hover group flex h-full flex-col overflow-hidden"
              >
                {/* Fixed-height preview so every card lines up */}
                <div className="border-b border-tc-line bg-white px-4 pb-5 pt-4">
                  <div className="mb-4 flex items-baseline justify-between">
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-tc-ink">
                      {tpl.name}
                    </h3>
                    <span className="font-mono text-[10.5px] text-tc-faint">.docx</span>
                  </div>
                  <div className="mx-auto h-[168px] w-[158px] overflow-hidden rounded-md border border-tc-line bg-white p-3 shadow-[0_6px_16px_-10px_rgba(11,27,51,0.4)] transition-transform duration-300 group-hover:-translate-y-1">
                    {tpl.rows.map((row, j) => (
                      <TemplateRowMark key={j} row={row} tpl={tpl} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11.5px] font-medium" style={{ color: tpl.accent }}>
                    {tpl.via}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {tpl.points.map(p => (
                      <li key={p} className="flex gap-2 text-[12.5px] leading-snug text-tc-muted">
                        <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-tc-faint" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
