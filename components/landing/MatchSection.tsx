'use client';

import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { IconMatch } from '@/components/ui/icons';

/**
 * Matching, on the marketing page.
 *
 * The claim that sells it is not "AI ranking" — it is that the answer comes
 * with its reasons, so the panel shows a scored candidate the way the product
 * actually shows one: the number, the verdict, the skills that decided it.
 */

const POINTS = [
  {
    title: 'Ranked best first',
    body: 'A 0–100 fit score for every resume you uploaded, blended from how closely it reads against the posting and a judgment of whether it meets the bar.',
  },
  {
    title: 'The evidence, not just a number',
    body: 'Each candidate comes back with the skills that matched, the ones missing, and a line saying why — so a shortlist can be defended, not just handed over.',
  },
  {
    title: 'Your set, and nothing else',
    body: 'Only the resumes uploaded from your account are searched. No shared pool, no other company’s bank in the results.',
  },
];

const CANDIDATES = [
  {
    name: 'Sushma R.',
    score: 92,
    verdict: 'Strong fit',
    matched: ['Python', 'Snowflake', 'Airflow'],
    missing: [] as string[],
  },
  {
    name: 'Bhargav N.',
    score: 88,
    verdict: 'Strong fit',
    matched: ['AWS Glue', 'dbt', 'SQL'],
    missing: ['Kafka'],
  },
  {
    name: 'Priya M.',
    score: 71,
    verdict: 'Possible fit',
    matched: ['Python', 'SQL'],
    missing: ['Snowflake', 'CI/CD'],
  },
];

export default function MatchSection() {
  return (
    <section id="match" className="border-t border-tc-line bg-tc-desk/40 py-20 lg:py-24">
      <div className="mx-auto max-w-[1140px] px-5">
        <SectionHeading label="Matching" title="One job description. The shortlist, ranked." />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* What it does */}
          <div>
            <p className="text-[16px] leading-[1.7] text-tc-muted">
              You already put resumes through Truecopy to format them. Add them to your set, paste
              the posting, and every one comes back scored against it — no keyword filters to tune,
              no spreadsheet to keep.
            </p>

            <dl className="mt-8 space-y-6">
              {POINTS.map(p => (
                <div key={p.title}>
                  <dt className="text-[15px] font-semibold text-tc-ink">{p.title}</dt>
                  <dd className="mt-1.5 text-[14.5px] leading-[1.65] text-tc-muted">{p.body}</dd>
                </div>
              ))}
            </dl>

            <ButtonLink href="/match" size="lg" className="mt-8">
              <IconMatch size={16} />
              Match to a job
            </ButtonLink>
          </div>

          {/* What it looks like */}
          <div className="rounded-xl border border-tc-line bg-white p-4 sm:p-5">
            <div className="rounded-lg border border-tc-line bg-tc-desk/60 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tc-faint">
                The job
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-tc-muted">
                Senior Data Engineer — ETL on AWS with Python, Snowflake, Airflow and dbt. 5+ years,
                strong SQL, CI/CD.
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              {CANDIDATES.map((c, i) => (
                <motion.article
                  key={c.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-lg border border-tc-line p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tc-desk-2 text-[11px] font-semibold text-tc-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[14.5px] font-semibold text-tc-ink">
                        {c.name}
                        <span
                          className={`rounded-md px-2 py-[3px] text-[11px] font-medium ${
                            c.score >= 80
                              ? 'bg-tc-mint/[0.10] text-tc-mint'
                              : 'bg-tc-amber/[0.10] text-tc-amber'
                          }`}
                        >
                          {c.verdict}
                        </span>
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-[20px] font-semibold leading-none text-tc-ink tabular-nums">
                      {c.score}
                    </p>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tc-desk-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.score}%` }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full rounded-full ${c.score >= 80 ? 'bg-tc-mint' : 'bg-tc-amber'}`}
                    />
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {c.matched.map(s => (
                      <li
                        key={s}
                        className="rounded-md bg-tc-mint/[0.08] px-2 py-[3px] text-[12px] text-tc-ink"
                      >
                        {s}
                      </li>
                    ))}
                    {c.missing.map(s => (
                      <li
                        key={s}
                        className="rounded-md border border-tc-line-2 px-2 py-[3px] text-[12px] text-tc-muted"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>

            <p className="mt-4 text-center text-[12px] text-tc-faint">
              Illustration of a result list. Scores come from the resumes you upload.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
