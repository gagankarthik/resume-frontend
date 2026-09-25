'use client';

import { useRef, useState } from 'react';
import { extractResume } from '@/lib/api';
import { ACCEPTED_TYPES, describeRejection } from '@/lib/files';

const ACCEPT = ACCEPTED_TYPES.flatMap(t => t.extensions).join(',');

type Item = { name: string; state: 'waiting' | 'working' | 'added' | 'skipped' | 'failed'; note?: string };

/**
 * Add resumes you already have to the map — a folder from an old requisition,
 * say. Two at a time, each read by the extraction engine exactly as an upload
 * is; the engine saves every extraction, and the map reads from there.
 */
export default function AddResumes({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const update = (i: number, patch: Partial<Item>) =>
    setItems(list => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const start = async (files: File[]) => {
    const list: Item[] = files.map(f => {
      const bad = describeRejection(f);
      return bad ? { name: f.name, state: 'failed', note: bad.message } : { name: f.name, state: 'waiting' };
    });
    setItems(list);
    setRunning(true);

    let next = 0;
    const worker = async () => {
      while (next < files.length) {
        const i = next++;
        if (list[i].state === 'failed') continue;
        update(i, { state: 'working' });
        try {
          const parsed = await extractResume(files[i]);
          const current = parsed.work_experience?.find(r => r.is_current) ?? parsed.work_experience?.[0];
          update(i, current?.company_name
            ? { state: 'added', note: current.company_name }
            : { state: 'skipped', note: 'No current employer on this resume, so it has no place on the map.' });
        } catch (e) {
          update(i, { state: 'failed', note: e instanceof Error ? e.message : 'Could not be read.' });
        }
      }
    };
    await Promise.all([worker(), worker()]);
    setRunning(false);
    onDone();
  };

  const done = items.filter(i => i.state === 'added').length;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-tc-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="ar-title">
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-tc-line px-6 py-4">
          <h2 id="ar-title" className="text-[17px] font-semibold text-tc-ink">Add resumes to the map</h2>
          <button type="button" onClick={onClose} disabled={running} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-md text-tc-muted hover:bg-tc-desk disabled:opacity-40">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {!items.length ? (
            <>
              <p className="text-[14.5px] leading-[1.6] text-tc-muted">
                Each resume is read the same way as a normal upload. The map shows only the employer, role, skills,
                experience and work location. Names, emails, phone numbers and home addresses are never shown.
              </p>
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="mt-5 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-tc-line-2 px-6 py-10 text-center transition-colors hover:border-tc-azure hover:bg-tc-azure/[0.03]"
              >
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="var(--color-tc-azure)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M10 12.5V3.5m0 0L7 6.5M10 3.5l3 3" />
                  <path d="M3.5 12v3A1.5 1.5 0 0 0 5 16.5h10a1.5 1.5 0 0 0 1.5-1.5v-3" />
                </svg>
                <span className="text-[15px] font-semibold text-tc-ink">Choose resumes</span>
                <span className="text-[13px] text-tc-muted">PDF, Word or text. Select as many as you like.</span>
              </button>
              <input
                ref={input}
                type="file"
                multiple
                accept={ACCEPT}
                className="hidden"
                onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) void start(f); }}
              />
            </>
          ) : (
            <>
              <p className="text-[14px] text-tc-muted">
                {running ? 'Reading resumes…' : `${done} of ${items.length} added to the map.`}
              </p>
              <ul className="mt-4 max-h-[340px] divide-y divide-tc-line overflow-y-auto rounded-lg border border-tc-line">
                {items.map((it, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        it.state === 'added' ? 'bg-tc-mint' : it.state === 'failed' ? 'bg-tc-rose' : it.state === 'skipped' ? 'bg-tc-amber' : it.state === 'working' ? 'animate-pulse bg-tc-azure' : 'bg-tc-line-2'
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-tc-ink">{it.name}</span>
                      {it.note && <span className="block text-[12.5px] text-tc-muted">{it.note}</span>}
                    </span>
                    <span className="text-[12.5px] capitalize text-tc-faint">{it.state}</span>
                  </li>
                ))}
              </ul>
              {!running && (
                <button type="button" onClick={onClose} className="mt-5 rounded-md bg-tc-ink px-4 py-2.5 text-[14px] font-medium text-white">
                  Done
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
