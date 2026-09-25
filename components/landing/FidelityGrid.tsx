import SectionHeading from './SectionHeading';

const SOURCE =
  'Migrated 14 legacy batch jobs to AWS Step Functions, cutting nightly run time from 6 hrs to 47 min.';

const RULES = [
  {
    title: 'Bullets are copied, not rewritten',
    body: 'No paraphrasing, no merging, no trimming to fit the template.',
    icon: (
      <>
        <rect x="3" y="3" width="10" height="13" rx="2" />
        <rect x="9" y="8" width="10" height="13" rx="2" fill="var(--color-tc-desk)" />
        <path d="M12 12.5h4M12 16h3" />
      </>
    ),
  },
  {
    title: 'Checked against the source',
    body: 'Every line is matched back to the original before you see it. Gaps are flagged.',
    icon: (
      <>
        <circle cx="10" cy="10" r="6.5" />
        <path d="m7.2 10.2 2 2 3.8-4.2" />
        <path d="m15 15 4 4" />
      </>
    ),
  },
  {
    title: 'Nothing is invented',
    body: 'Contact details and dates are kept only when they appear in the file.',
    icon: (
      <>
        <rect x="4" y="3" width="14" height="16" rx="2.5" />
        <path d="M8 8h6M8 11.5h6" />
        <path d="M8 15h3" strokeDasharray="1 2" />
      </>
    ),
  },
  {
    title: 'You sign it off',
    body: 'A full editor sits between extraction and download. Nothing exports until you say so.',
    icon: (
      <>
        <path d="M4 17.5c2.5 0 3-4 5-4s1.5 3 3.5 3 2.5-2 4.5-2" />
        <path d="m13 4 4 4-6.5 6.5H6.5v-4L13 4Z" />
      </>
    ),
  },
];

export default function FidelityGrid() {
  const chars = SOURCE.length;

  return (
    <section id="controls" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-5">
        <SectionHeading
          title="A copy is only useful if it is true."
          lede="Agencies reject submittals that don’t match what the candidate wrote. Blue-IQ Hire changes the layout and leaves the words alone."
        />

        {/* Proof: the same bullet, in and out */}
        <figure className="mt-14 overflow-hidden rounded-xl border border-tc-line">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-tc-line p-6 sm:p-8 md:border-b-0 md:border-r">
              <p className="mb-4 flex items-center gap-2 text-[13px] font-medium text-tc-muted">
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
                  <path d="M2.5 1h6L12 4.5V14a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" stroke="currentColor" />
                  <path d="M8.5 1v3.5H12" stroke="currentColor" />
                </svg>
                In the candidate&rsquo;s file
              </p>
              <p className="text-[16px] leading-[1.65] text-tc-ink">{SOURCE}</p>
            </div>
            <div className="bg-tc-mint/[0.035] p-6 sm:p-8">
              <p className="mb-4 flex items-center gap-2 text-[13px] font-medium text-tc-mint">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="6" stroke="currentColor" />
                  <path d="m4.4 7.2 1.8 1.8 3.4-3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                In the Ohio submittal
              </p>
              <p className="text-[16px] leading-[1.65] text-tc-ink">{SOURCE}</p>
            </div>
          </div>

          {/* one tick per character, all in register */}
          <div className="border-t border-tc-line bg-tc-desk px-6 py-4 sm:px-8">
            <div className="flex h-3 items-end justify-between gap-px overflow-hidden" aria-hidden>
              {Array.from({ length: chars }).map((_, i) => (
                <span
                  key={i}
                  className="w-[2px] shrink-0 rounded-full bg-tc-mint"
                  style={{ height: SOURCE[i] === ' ' ? 4 : 12, opacity: SOURCE[i] === ' ' ? 0.35 : 0.7 }}
                />
              ))}
            </div>
            <figcaption className="mt-3 text-[13.5px] text-tc-muted">
              {chars} of {chars} characters identical. Only the page around them changed.
            </figcaption>
          </div>
        </figure>

        <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(r => (
            <li key={r.title} className="border-t border-tc-ink pt-5">
              <svg
                width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="var(--color-tc-azure)"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
              >
                {r.icon}
              </svg>
              <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-tc-ink">{r.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-tc-muted">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
