'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UploadZone from '@/components/upload/UploadZone';
import AppHeader from '@/components/app/AppHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { extractResume } from '@/lib/api';
import { saveResume } from '@/lib/store';

type Stage = 'idle' | 'working' | 'done' | 'error';

const PASSES = [
  { label: 'Reading the file', detail: 'Text pulled out in reading order' },
  { label: 'Extracting sections', detail: 'Fields separated and labelled' },
  { label: 'Checking against source', detail: 'Every line matched back' },
  { label: 'Building the record', detail: 'Ready for review' },
];

export default function UploadPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [pass, setPass] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  useEffect(() => {
    if (stage !== 'working') return;
    const id = setInterval(() => setPass(p => Math.min(p + 1, PASSES.length - 2)), 3000);
    return () => clearInterval(id);
  }, [stage]);

  const handleUpload = async (file: File) => {
    setError(null);
    setStage('working');
    setPass(0);
    setFilename(file.name);

    try {
      const result = await extractResume(file);
      setPass(PASSES.length - 1);
      setStage('done');
      saveResume(result);
      setTimeout(() => router.push('/editor'), 800);
    } catch (err) {
      setStage('error');
      setError(
        err instanceof Error
          ? err.message
          : 'The file could not be processed. Check your connection and try again.',
      );
    }
  };

  const reset = () => {
    setStage('idle');
    setPass(0);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader step="Upload">
        <ButtonLink href="/editor" variant="ghost" size="sm">
          Skip to editor
        </ButtonLink>
      </AppHeader>

      <main className="mx-auto grid w-full max-w-[1140px] flex-1 gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-14">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-tc-ink">
            Upload a resume
          </h1>
          <p className="mt-2 text-[15px] text-tc-muted">
            One file at a time. Nothing is written to disk on our side.
          </p>

          <div className="mt-8 rounded-xl border border-tc-line bg-white p-6">
            {stage === 'idle' && <UploadZone onUpload={handleUpload} />}

            {stage === 'working' && (
              <div className="py-2">
                <div className="mb-7 flex items-center gap-3 rounded-lg border border-tc-line bg-tc-desk/60 px-4 py-3">
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-tc-line-2 border-t-tc-azure" />
                  <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-tc-ink">{filename}</p>
                </div>

                <ol className="space-y-1.5">
                  {PASSES.map((p, i) => {
                    const done = i < pass;
                    const now = i === pass;
                    return (
                      <li
                        key={p.label}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          now ? 'bg-tc-azure/[0.06]' : 'bg-transparent'
                        }`}
                      >
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
                            done
                              ? 'bg-tc-mint text-white'
                              : now
                                ? 'bg-tc-azure text-white'
                                : 'border border-tc-line text-tc-faint'
                          }`}
                        >
                          {done ? (
                            <svg width="10" height="10" viewBox="0 0 8 8" fill="none" aria-hidden>
                              <path d="M1 4.2 3 6.2 7 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </span>
                        <span className="flex-1">
                          <span
                            className={`block text-[14px] font-medium ${
                              done || now ? 'text-tc-ink' : 'text-tc-faint'
                            }`}
                          >
                            {p.label}
                          </span>
                          <span className="block text-[12.5px] text-tc-muted">{p.detail}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <p className="mt-6 text-center text-[12.5px] text-tc-faint">
                  This takes up to a minute. Keep this tab open.
                </p>
              </div>
            )}

            {stage === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-10 text-center"
              >
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-tc-mint text-white">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M5 10.5 8.5 14 15 6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-[17px] font-semibold text-tc-ink">Record built</p>
                <p className="mt-1 text-[14px] text-tc-muted">Opening the editor…</p>
              </motion.div>
            )}

            {stage === 'error' && (
              <div className="py-2">
                <div className="rounded-lg border border-tc-rose/30 bg-tc-rose/[0.05] p-4">
                  <p className="text-[14.5px] font-medium text-tc-ink">The file could not be processed</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-tc-muted">{error}</p>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Button onClick={reset}>Try another file</Button>
                  <span className="text-[13px] text-tc-faint">
                    Text-based PDFs and Word files give the cleanest result.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-tc-line p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-tc-faint">
              What happens next
            </h2>
            <ol className="mt-4 space-y-3">
              {[
                'Review every extracted field in the editor',
                'Fix anything flagged against the source',
                'Pick a template and export a .docx',
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-tc-desk-2 text-[10px] font-semibold text-tc-muted">
                    {i + 1}
                  </span>
                  <span className="text-[13.5px] leading-snug text-tc-muted">{t}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-tc-line p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-tc-faint">
              Handling
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                'Held in memory for the request only',
                'Never written to disk on our servers',
                'The record stays in your browser',
              ].map(t => (
                <li key={t} className="flex gap-2.5 text-[13.5px] leading-snug text-tc-muted">
                  <svg width="13" height="13" viewBox="0 0 8 8" fill="none" aria-hidden className="mt-[3px] shrink-0 text-tc-mint">
                    <path d="M1 4.2 3 6.2 7 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
