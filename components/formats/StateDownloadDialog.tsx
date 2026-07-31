'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResumeData } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconClose, IconDownload, IconPrint } from '@/components/ui/icons';

type StateOption = 'ohio' | 'pennsylvania' | 'oceanblue' | 'georgia';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  defaultFormat?: StateOption;
}

/**
 * Export.
 *
 * One decision — which template — then the file. The templates are listed as
 * rows with what each one is actually for, because "Ohio" and "Pennsylvania"
 * mean nothing on their own to someone filling a requisition; the system that
 * expects the format is the useful part of the name.
 */
const TEMPLATES: { id: StateOption; label: string; detail: string }[] = [
  { id: 'ohio',         label: 'Ohio',         detail: 'VectorVMS submissions' },
  { id: 'pennsylvania', label: 'Pennsylvania', detail: 'PeopleFluent submissions' },
  { id: 'georgia',      label: 'Georgia',      detail: 'GA state standard' },
  { id: 'oceanblue',    label: 'Oceanblue',    detail: 'Plain ATS-safe layout' },
];

export default function StateDownloadDialog({
  isOpen,
  onClose,
  resumeData,
  defaultFormat = 'ohio',
}: Props) {
  const [selected, setSelected] = useState<StateOption>(defaultFormat);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setSelected(defaultFormat);
  }, [isOpen, defaultFormat]);

  // Escape closes, and focus moves into the dialog so the keyboard lands here.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const download = async () => {
    setDownloading(true);
    setError(null);
    try {
      const docx = await import('@/lib/docx');
      if (selected === 'ohio') await docx.buildOhioDocx(resumeData);
      else if (selected === 'pennsylvania') await docx.buildPADocx(resumeData);
      else if (selected === 'oceanblue') await docx.buildOceanblueDocx(resumeData);
      else await docx.buildGeorgiaDocx(resumeData);
    } catch (e) {
      console.error('DOCX generation failed', e);
      setError('The document could not be built. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tc-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        tabIndex={-1}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-tc-line bg-white shadow-[0_24px_60px_-24px_rgba(11,27,51,0.45)] outline-none sm:max-w-[460px] sm:rounded-2xl"
      >
        <div className="flex items-start gap-4 border-b border-tc-line px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id="export-title" className="text-[17px] font-semibold text-tc-ink">
              Export
            </h2>
            <p className="mt-0.5 text-[13px] text-tc-muted">
              Every field you reviewed goes into the file.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 shrink-0 rounded-md p-1.5 text-tc-faint transition-colors hover:bg-tc-desk hover:text-tc-ink"
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tc-faint">
            Template
          </p>

          <div role="radiogroup" aria-label="Template" className="mt-3 space-y-2">
            {TEMPLATES.map(t => {
              const active = selected === t.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(t.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    active
                      ? 'border-tc-azure bg-tc-azure/[0.05]'
                      : 'border-tc-line hover:border-tc-line-2 hover:bg-tc-desk/60'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-tc-ink">{t.label}</span>
                    <span className="block text-[12.5px] text-tc-muted">{t.detail}</span>
                  </span>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                      active ? 'border-tc-azure bg-tc-azure text-white' : 'border-tc-line-2'
                    }`}
                  >
                    {active && <IconCheck size={12} />}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-tc-rose/30 bg-tc-rose/[0.05] px-3 py-2 text-[12.5px] text-tc-ink">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
            <Button onClick={download} disabled={downloading} className="w-full sm:w-auto sm:flex-1">
              <IconDownload size={14} />
              {downloading ? 'Building…' : 'Download .docx'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="w-full sm:w-auto sm:flex-1"
            >
              <IconPrint size={14} />
              Print or PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
