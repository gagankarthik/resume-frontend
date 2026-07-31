'use client';

import { motion } from 'framer-motion';

export default function SectionHeading({
  label,
  title,
  align = 'left',
  className = '',
}: {
  label: string;
  title: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-tc-azure">{label}</p>
      <h2 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-tc-ink sm:text-[36px]">
        {title}
      </h2>
    </motion.div>
  );
}
