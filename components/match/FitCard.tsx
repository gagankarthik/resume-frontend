import type { Verdict } from '@/lib/match/types';

/**
 * One fit result: a score, a verdict, and the evidence behind them.
 *
 * The same card serves a ranked candidate and the open resume, because the
 * question is identical in both directions — how well does this person meet
 * this job, and which skills decided it.
 */

const TONE: Record<string, { chip: string; bar: string; label: string }> = {
  strong:   { chip: 'bg-tc-mint/[0.10] text-tc-mint',   bar: 'bg-tc-mint',  label: 'Strong fit' },
  possible: { chip: 'bg-tc-amber/[0.10] text-tc-amber', bar: 'bg-tc-amber', label: 'Possible fit' },
  weak:     { chip: 'bg-tc-rose/[0.08] text-tc-rose',   bar: 'bg-tc-rose',  label: 'Weak fit' },
};

function tone(verdict: Verdict) {
  return TONE[String(verdict).toLowerCase()] ?? {
    chip: 'bg-tc-desk-2 text-tc-muted',
    bar: 'bg-tc-faint',
    label: String(verdict),
  };
}

function SkillList({
  title,
  skills,
  className,
}: {
  title: string;
  skills: string[];
  className: string;
}) {
  if (skills.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tc-faint">{title}</p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {skills.map(s => (
          <li key={s} className={`rounded-md px-2 py-[3px] text-[12px] ${className}`}>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface FitCardProps {
  /** 1-based position in a ranked list; omitted for a single result. */
  rank?: number;
  name?: string | null;
  resumeId?: string | null;
  fitScore: number;
  /** Raw cosine similarity, 0–1. Shown only when the engine reports one. */
  similarity?: number;
  qualified: boolean;
  verdict: Verdict;
  matchedSkills: string[];
  missingSkills: string[];
  rationale?: string | null;
}

export default function FitCard({
  rank,
  name,
  resumeId,
  fitScore,
  similarity,
  qualified,
  verdict,
  matchedSkills,
  missingSkills,
  rationale,
}: FitCardProps) {
  const t = tone(verdict);
  const score = Math.max(0, Math.min(100, Math.round(fitScore)));

  return (
    <article className="rounded-xl border border-tc-line bg-white p-5">
      <div className="flex items-start gap-4">
        {rank !== undefined && (
          <span className="mt-[3px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tc-desk-2 text-[11px] font-semibold text-tc-muted">
            {rank}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="text-[15.5px] font-semibold text-tc-ink">
              {name?.trim() || 'Unnamed candidate'}
            </h3>
            <span className={`rounded-md px-2 py-[3px] text-[11.5px] font-medium ${t.chip}`}>
              {t.label}
            </span>
            {!qualified && (
              <span className="rounded-md bg-tc-desk-2 px-2 py-[3px] text-[11.5px] font-medium text-tc-muted">
                Below the bar
              </span>
            )}
          </div>

          {resumeId && (
            <p className="mt-1 truncate font-mono text-[11.5px] text-tc-faint" title={resumeId}>
              {resumeId}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-[26px] leading-none font-semibold text-tc-ink tabular-nums">
            {score}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-tc-faint">Fit</p>
        </div>
      </div>

      {/* The score, drawn. Colour carries the verdict, never decoration. */}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-tc-desk-2">
        <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${score}%` }} />
      </div>

      {rationale && (
        <p className="mt-4 text-[13.5px] leading-relaxed text-tc-muted">{rationale}</p>
      )}

      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SkillList
            title="Matched"
            skills={matchedSkills}
            className="bg-tc-mint/[0.08] text-tc-ink"
          />
          <SkillList
            title="Missing"
            skills={missingSkills}
            className="border border-tc-line-2 text-tc-muted"
          />
        </div>
      )}

      {similarity !== undefined && (
        <p className="mt-4 border-t border-tc-line pt-3 font-mono text-[11.5px] text-tc-faint">
          similarity {similarity.toFixed(3)}
        </p>
      )}
    </article>
  );
}
