'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AppHeader from '@/components/app/AppHeader';
import BatchUpload from '@/components/match/BatchUpload';
import FitCard from '@/components/match/FitCard';
import { Button } from '@/components/ui/Button';
import { IconAlert } from '@/components/ui/icons';
import { ingestQueue, matchCandidates, removeResume } from '@/lib/match/client';
import { displayName } from '@/lib/match/resume';
import type { MatchCandidate } from '@/lib/match/types';
import {
  loadBatch,
  loadJobDraft,
  saveBatch,
  saveJobDraft,
  type BatchItem,
  type BatchStatus,
} from '@/lib/store';

type Stage = 'idle' | 'working' | 'done' | 'error';

/** A numbered step heading. Two of them, and that is the whole page. */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-tc-line p-5">
      <h2 className="flex items-center gap-2.5 text-[14.5px] font-semibold text-tc-ink">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-tc-ink text-[11px] font-semibold text-white">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function MatchPage() {
  const [jobText, setJobText] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[] | null>(null);

  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const matchAbort = useRef<AbortController | null>(null);
  const uploadAbort = useRef<AbortController | null>(null);
  /** The dropped files themselves, for this session only — the browser keeps
   *  the record of a batch, but it cannot keep the files. */
  const files = useRef(new Map<string, File>());

  useEffect(() => {
    // localStorage cannot be read during render — that pass also runs on the
    // server — so the handoff from the browser's store happens once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBatch(loadBatch());
    const draft = loadJobDraft();
    if (draft) setJobText(draft);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => saveJobDraft(jobText), 400);
    return () => clearTimeout(id);
  }, [jobText]);

  const setItemStatus = useCallback((resumeId: string, status: BatchStatus, err?: string) => {
    setBatch(prev => {
      const next = prev.map(item =>
        item.resumeId === resumeId ? { ...item, status, error: err } : item,
      );
      saveBatch(next);
      return next;
    });
  }, []);

  /** Send everything still queued through the engine, a few at a time. */
  const drainQueue = useCallback(
    async (items: BatchItem[]) => {
      const pending = items.filter(i => i.status === 'queued');
      const ready = pending.filter(i => files.current.has(i.resumeId));
      const missing = pending.length - ready.length;

      setNotice(
        missing > 0
          ? `${missing} file${missing === 1 ? '' : 's'} from an earlier session — drop ${missing === 1 ? 'it' : 'them'} in again to finish.`
          : null,
      );
      if (ready.length === 0) return;

      const ac = new AbortController();
      uploadAbort.current = ac;
      setUploading(true);

      await ingestQueue(
        ready.map(i => files.current.get(i.resumeId)!),
        {
          signal: ac.signal,
          onStart: file => setItemStatus(file.name, 'working'),
          onSettled: (file, result) =>
            result.ok
              ? setItemStatus(file.name, result.skipped ? 'skipped' : 'indexed')
              : setItemStatus(file.name, 'failed', result.error),
        },
      );

      setUploading(false);
      uploadAbort.current = null;
    },
    [setItemStatus],
  );

  const onFiles = useCallback(
    (dropped: File[]) => {
      dropped.forEach(f => files.current.set(f.name, f));

      // The filename is the id, so dropping the same file twice re-queues it
      // rather than listing it twice.
      setBatch(prev => {
        const byId = new Map(prev.map(item => [item.resumeId, item]));
        dropped.forEach(f =>
          byId.set(f.name, { resumeId: f.name, filename: f.name, status: 'queued' }),
        );
        const next = [...byId.values()];
        saveBatch(next);
        void drainQueue(next);
        return next;
      });
    },
    [drainQueue],
  );

  const onRemove = useCallback((resumeId: string) => {
    files.current.delete(resumeId);
    setBatch(prev => {
      const next = prev.filter(item => item.resumeId !== resumeId);
      saveBatch(next);
      return next;
    });
    // Best effort on the far side; the list is what the person sees.
    void removeResume(resumeId).catch(() => {});
  }, []);

  const run = useCallback(async () => {
    const text = jobText.trim();
    if (!text) {
      setStage('error');
      setError('Paste the job description first.');
      return;
    }

    matchAbort.current?.abort();
    const ac = new AbortController();
    matchAbort.current = ac;

    setStage('working');
    setError(null);
    setCandidates(null);

    try {
      const res = await matchCandidates(text, ac.signal);
      setCandidates(res.candidates);
      setStage('done');
    } catch (err) {
      if (ac.signal.aborted) {
        setStage('idle');
        return;
      }
      setStage('error');
      setError(err instanceof Error ? err.message : 'The match could not be completed.');
    }
  }, [jobText]);

  const working = stage === 'working';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader />

      <main className="mx-auto grid w-full max-w-[1140px] flex-1 gap-8 px-5 py-10 lg:grid-cols-[400px_minmax(0,1fr)] lg:py-14">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-tc-ink">Match to a job</h1>
          <p className="mt-2 text-[15px] text-tc-muted">
            Add resumes, paste the job, see who fits.
          </p>

          <div className="mt-8 space-y-4">
            <Step n={1} title="Add resumes">
              <BatchUpload
                items={batch}
                running={uploading}
                onFiles={onFiles}
                onStop={() => uploadAbort.current?.abort()}
                onRemove={onRemove}
              />
              {notice && <p className="mt-3 text-[12.5px] leading-relaxed text-tc-amber">{notice}</p>}
            </Step>

            <Step n={2} title="Paste the job">
              <textarea
                value={jobText}
                onChange={e => setJobText(e.target.value)}
                rows={12}
                aria-label="Job description"
                placeholder="Paste the posting — the role, the requirements, and the skills that matter."
                className="gov-input resize-y font-sans leading-relaxed"
              />
            </Step>

            <div className="flex items-center gap-3">
              <Button size="lg" onClick={run} disabled={working || !jobText.trim()}>
                {working ? 'Matching…' : 'Find matches'}
              </Button>
              {working && (
                <button
                  type="button"
                  onClick={() => matchAbort.current?.abort()}
                  className="text-[13px] text-tc-muted underline underline-offset-2 hover:text-tc-ink"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <section aria-live="polite">
          {stage === 'idle' && (
            <div className="rounded-xl border border-dashed border-tc-line-2 p-10 text-center">
              <p className="text-[15px] font-medium text-tc-ink">No match run yet</p>
              <p className="mx-auto mt-2 max-w-[400px] text-[13.5px] leading-relaxed text-tc-muted">
                Resumes are shortlisted against the description, then read again to explain each
                verdict.
              </p>
            </div>
          )}

          {working && (
            <div className="rounded-xl border border-tc-line p-10 text-center">
              <span className="mx-auto mb-4 block h-6 w-6 animate-spin rounded-full border-2 border-tc-line-2 border-t-tc-azure" />
              <p className="text-[15px] font-medium text-tc-ink">Reading the resumes</p>
              <p className="mt-2 text-[13.5px] text-tc-muted">
                This takes a few seconds. Keep this tab open.
              </p>
            </div>
          )}

          {stage === 'error' && (
            <div className="rounded-xl border border-tc-rose/30 bg-tc-rose/[0.05] p-5">
              <p className="flex items-center gap-2 text-[14.5px] font-medium text-tc-ink">
                <IconAlert size={15} />
                The match did not run
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-tc-muted">{error}</p>
            </div>
          )}

          {stage === 'done' && candidates && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[17px] font-semibold text-tc-ink">
                  {candidates.length === 0
                    ? 'No candidates'
                    : `${candidates.length} candidate${candidates.length === 1 ? '' : 's'}, best first`}
                </h2>
                {candidates.length > 0 && (
                  <span className="text-[12.5px] text-tc-faint">
                    {candidates.filter(c => c.qualified).length} qualified
                  </span>
                )}
              </div>

              {candidates.length === 0 ? (
                <div className="mt-4 rounded-xl border border-tc-line p-8 text-center">
                  <p className="text-[14.5px] font-medium text-tc-ink">Nothing came back</p>
                  <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-relaxed text-tc-muted">
                    None of your resumes came close enough to rank. Add more above and run it again.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {candidates.map((c, i) => (
                    <FitCard
                      key={c.resume_id}
                      rank={i + 1}
                      name={displayName(c.candidate_name, c.resume_id)}
                      resumeId={c.resume_id}
                      fitScore={c.fit_score}
                      similarity={c.similarity}
                      qualified={c.qualified}
                      verdict={c.verdict}
                      matchedSkills={c.matched_skills}
                      missingSkills={c.missing_skills}
                      rationale={c.rationale}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
