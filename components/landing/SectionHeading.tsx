import type { ReactNode } from 'react';

/**
 * A section opens with what it is about and one sentence of why it matters.
 * No eyebrow label — the headline says it.
 */
export default function SectionHeading({
  title,
  lede,
  tone = 'light',
  className = '',
}: {
  title: string;
  lede?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div className={`max-w-[34rem] ${className}`}>
      <h2
        className={`text-[30px] font-semibold leading-[1.1] tracking-[-0.028em] sm:text-[40px] ${
          dark ? 'text-white' : 'text-tc-ink'
        }`}
      >
        {title}
      </h2>
      {lede && (
        <p className={`mt-4 text-[16.5px] leading-[1.6] ${dark ? 'text-white/65' : 'text-tc-muted'}`}>
          {lede}
        </p>
      )}
    </div>
  );
}
