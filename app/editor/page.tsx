'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { APIResponse } from '@/lib/types';
import { loadResume, saveResume } from '@/lib/store';
import { mapToResumeData } from '@/lib/mapper';
import ResumeEditor from '@/components/editor/ResumeEditor';
import ResumePreview from '@/components/formats/ResumePreview';
import StateDownloadDialog from '@/components/formats/StateDownloadDialog';
import AppHeader from '@/components/app/AppHeader';
import { Button } from '@/components/ui/Button';
import { IconClose, IconDownload, IconPreview, IconPrint } from '@/components/ui/icons';

type StateFormat = 'ohio' | 'pennsylvania' | 'oceanblue' | 'georgia';

const FORMATS: { id: StateFormat; label: string }[] = [
  { id: 'ohio',         label: 'Ohio (VectorVMS)' },
  { id: 'pennsylvania', label: 'Pennsylvania (PeopleFluent)' },
  { id: 'georgia',      label: 'Georgia (GA Standard)' },
  { id: 'oceanblue',    label: 'Oceanblue (ATS)' },
];

/** How much of the width the fields keep, in percent. Clamped so neither side
 *  can be dragged out of usefulness. */
const MIN_SPLIT = 30;
const MAX_SPLIT = 75;

/**
 * Review the extracted record.
 *
 * One section at a time, on a plain page. The formatted result is a panel you
 * open when you want to check it, and drag to whatever width the comparison
 * needs — a wide preview to read the layout, a narrow one to keep typing.
 */
export default function EditorPage() {
  const router = useRouter();
  const [apiData, setApiData] = useState<APIResponse | null>(null);
  const [format, setFormat] = useState<StateFormat>('ohio');
  const [saved, setSaved] = useState(true);
  const [preview, setPreview] = useState(false);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [split, setSplit] = useState(55);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const data = loadResume();
    if (!data) {
      router.replace('/upload');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApiData(data);
  }, [router]);

  // The divider. Pointer capture keeps the drag alive over the preview iframe
  // and off the edge of the window, and covers touch and pen without a second
  // set of handlers.
  const startDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const onDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(Math.max(pct, MIN_SPLIT), MAX_SPLIT));
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Same handle, from the keyboard.
  const nudge = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowLeft' ? -2 : e.key === 'ArrowRight' ? 2 : 0;
    if (step === 0) return;
    e.preventDefault();
    setSplit(s => Math.min(Math.max(s + step, MIN_SPLIT), MAX_SPLIT));
  }, []);

  const handleChange = useCallback((updated: APIResponse) => {
    setApiData(updated);
    saveResume(updated);
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 700);
    return () => clearTimeout(t);
  }, []);

  if (!apiData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-tc-line-2 border-t-tc-azure" />
          <p className="text-[13.5px] text-tc-muted">Loading…</p>
        </div>
      </div>
    );
  }

  const resumeData = mapToResumeData(apiData);

  return (
    <div className="min-h-screen bg-white">
      <AppHeader>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPreview(p => !p)}
          aria-pressed={preview}
          title={preview ? 'Hide preview' : 'Show preview'}
        >
          <IconPreview size={13} />
          <span className="hidden md:inline">{preview ? 'Hide preview' : 'Preview'}</span>
        </Button>

        <Button size="sm" onClick={() => setDlgOpen(true)}>
          <IconDownload size={13} />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </AppHeader>

      <div
        ref={containerRef}
        className={preview ? 'lg:flex lg:h-[calc(100vh-4rem)] lg:overflow-hidden' : ''}
      >
        <main
          className={preview ? 'lg:h-full lg:shrink-0 lg:overflow-y-auto' : ''}
          // Width only means anything beside the preview; on a narrow screen the
          // panel covers the page anyway.
          style={preview ? { width: `${split}%` } : undefined}
        >
          <ResumeEditor
            data={apiData}
            onChange={handleChange}
            onExport={() => setDlgOpen(true)}
            // The file it came from, or who it belongs to when the extraction
            // did not report a filename.
            label={apiData._metadata?.filename || apiData.personal_information?.full_name || ''}
            saved={saved}
            // Beside the preview this pane scrolls on its own, so the tabs pin
            // to the pane rather than clearing the site header.
            stickyUnderHeader={!preview}
          />
        </main>

        {preview && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize preview"
            aria-valuenow={Math.round(split)}
            aria-valuemin={MIN_SPLIT}
            aria-valuemax={MAX_SPLIT}
            tabIndex={0}
            onPointerDown={startDrag}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={nudge}
            className="group relative hidden w-1.5 shrink-0 cursor-col-resize bg-tc-line transition-colors hover:bg-tc-azure focus-visible:bg-tc-azure lg:block"
          >
            <span className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className="h-1 w-1 rounded-full bg-white" />
              ))}
            </span>
          </div>
        )}

        {/* The formatted result. A resizable side panel on a wide screen, a
            sheet on a narrow one — never a permanent half of the page. */}
        {preview && (
          <aside
            className="fixed inset-0 z-40 flex flex-col bg-tc-desk lg:static lg:z-auto lg:h-full lg:min-w-0 lg:flex-1"
            aria-label="Preview"
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-tc-line bg-white px-4 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tc-faint">
                Preview
              </p>

              <select
                value={format}
                onChange={e => setFormat(e.target.value as StateFormat)}
                aria-label="Template"
                className="ml-auto rounded-md border border-tc-line-2 bg-white px-2 py-1 text-[12.5px] text-tc-ink focus:border-tc-azure focus:outline-none"
              >
                {FORMATS.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                title="Print"
                aria-label="Print"
                className="rounded-md p-1.5 text-tc-muted hover:bg-tc-desk hover:text-tc-ink"
              >
                <IconPrint size={15} />
              </button>

              <button
                onClick={() => setPreview(false)}
                aria-label="Close preview"
                className="rounded-md p-1.5 text-tc-muted hover:bg-tc-desk hover:text-tc-ink lg:hidden"
              >
                <IconClose size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ResumePreview resumeData={resumeData} format={format} />
            </div>
          </aside>
        )}
      </div>

      <StateDownloadDialog
        isOpen={dlgOpen}
        onClose={() => setDlgOpen(false)}
        resumeData={resumeData}
        defaultFormat={format}
      />
    </div>
  );
}
