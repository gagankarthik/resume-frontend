'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { IconClose } from '@/components/ui/icons';
import type { BatchItem, BatchStatus } from '@/lib/store';

/**
 * The resume set: drop files in, and each one is read and made searchable.
 *
 * A hundred resumes is a hundred parses, so the panel reports as it goes —
 * what is ready, what is in flight, what failed — instead of one bar that
 * hides everything until the end.
 */

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
};

const STATUS: Record<BatchStatus, { dot: string; label: string }> = {
  queued:  { dot: 'bg-tc-line-2',              label: 'Waiting' },
  working: { dot: 'bg-tc-azure animate-pulse', label: 'Reading' },
  indexed: { dot: 'bg-tc-mint',                label: 'Ready' },
  skipped: { dot: 'bg-tc-mint/40',             label: 'Ready' },
  failed:  { dot: 'bg-tc-rose',                label: 'Failed' },
};

export interface BatchUploadProps {
  items: BatchItem[];
  running: boolean;
  onFiles: (files: File[]) => void;
  onStop: () => void;
  onRemove: (resumeId: string) => void;
}

export default function BatchUpload({
  items,
  running,
  onFiles,
  onStop,
  onRemove,
}: BatchUploadProps) {
  const [rejected, setRejected] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], refused: FileRejection[]) => {
      setRejected(
        refused.length === 0
          ? null
          : `${refused.length} file${refused.length === 1 ? '' : 's'} skipped — use PDF, DOCX, DOC, or TXT under 20 MB.`,
      );
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 20 * 1024 * 1024,
    multiple: true,
    disabled: running,
  });

  const ready = items.filter(i => i.status === 'indexed' || i.status === 'skipped').length;
  const failed = items.filter(i => i.status === 'failed').length;
  const left = items.filter(i => i.status === 'queued' || i.status === 'working').length;

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border border-dashed px-4 py-7 text-center transition-colors ${
          running
            ? 'cursor-not-allowed border-tc-line bg-tc-desk/40 opacity-60'
            : isDragActive
              ? 'border-tc-azure bg-tc-azure/[0.06]'
              : 'border-tc-line-2 bg-tc-desk/50 hover:border-tc-azure/60 hover:bg-tc-azure/[0.03]'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-[14px] font-medium text-tc-ink">
          {isDragActive ? (
            'Drop them to start'
          ) : (
            <>
              Drop resumes here, or{' '}
              <span className="text-tc-azure underline underline-offset-2">browse</span>
            </>
          )}
        </p>
        <p className="mt-1 text-[12.5px] text-tc-muted">PDF, DOCX, DOC, or TXT. As many as you like.</p>
      </div>

      {rejected && <p className="mt-3 text-[12.5px] text-tc-amber">{rejected}</p>}

      {items.length > 0 && (
        <>
          <div className="mt-4 flex items-center justify-between text-[12.5px]">
            <span className="text-tc-muted">
              {ready} ready
              {left > 0 && <span className="text-tc-faint"> · {left} to go</span>}
              {failed > 0 && <span className="text-tc-rose"> · {failed} failed</span>}
            </span>
            {running && (
              <button
                type="button"
                onClick={onStop}
                className="text-tc-muted underline underline-offset-2 hover:text-tc-ink"
              >
                Stop
              </button>
            )}
          </div>

          <ul className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-tc-line">
            {items.map(item => {
              const s = STATUS[item.status];
              return (
                <li
                  key={item.resumeId}
                  className="group flex items-center gap-2.5 px-3 py-2 text-[12.5px] odd:bg-tc-desk/40"
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-tc-ink" title={item.filename}>
                    {item.filename}
                  </span>
                  <span
                    className={`shrink-0 ${item.status === 'failed' ? 'text-tc-rose' : 'text-tc-faint'}`}
                    title={item.error}
                  >
                    {s.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.resumeId)}
                    aria-label={`Remove ${item.filename}`}
                    // Always there on touch, where nothing ever hovers.
                    className="shrink-0 rounded p-0.5 text-tc-faint transition-opacity hover:text-tc-rose focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <IconClose size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
