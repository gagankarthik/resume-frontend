'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';

interface Props {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
};

const UploadZone: React.FC<Props> = ({ onUpload, disabled }) => {
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        const code = rejected[0].errors[0]?.code;
        setError(
          code === 'file-too-large'
            ? 'That file is over 20 MB. Try a smaller one.'
            : code === 'file-invalid-type'
              ? 'That file type is not supported. Use PDF, DOCX, DOC, or TXT.'
              : (rejected[0].errors[0]?.message ?? 'That file could not be read.'),
        );
        return;
      }
      if (accepted.length > 0) {
        setPicked(accepted[0].name);
        onUpload(accepted[0]);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled,
  });

  const state = error ? 'error' : picked ? 'done' : isDragActive ? 'drag' : 'idle';

  const frame = {
    idle: 'border-tc-line-2 bg-tc-desk/50 hover:border-tc-azure/60 hover:bg-tc-azure/[0.03]',
    drag: 'border-tc-azure bg-tc-azure/[0.06]',
    done: 'border-tc-mint/60 bg-tc-mint/[0.05]',
    error: 'border-tc-rose/60 bg-tc-rose/[0.04]',
  }[state];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-12 text-center transition-colors duration-200 ${frame} ${
          disabled ? 'cursor-not-allowed opacity-60' : ''
        }`}
      >
        <input {...getInputProps()} />

        <span
          className={`grid h-12 w-12 place-items-center rounded-xl border ${
            state === 'error'
              ? 'border-tc-rose/30 bg-white text-tc-rose'
              : state === 'done'
                ? 'border-tc-mint/30 bg-white text-tc-mint'
                : 'border-tc-line bg-white text-tc-azure'
          }`}
        >
          {state === 'error' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M10 6.5v4.5M10 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          ) : state === 'done' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 10.5 8.5 14 15 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.5 12.5v2A1.5 1.5 0 0 0 5 16h10a1.5 1.5 0 0 0 1.5-1.5v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </span>

        {state === 'done' && (
          <div>
            <p className="font-mono text-[13.5px] text-tc-ink">{picked}</p>
            <p className="mt-1 text-[13px] text-tc-mint">Reading the file…</p>
          </div>
        )}

        {state === 'drag' && (
          <p className="text-[15px] font-medium text-tc-azure">Drop it to start</p>
        )}

        {state === 'error' && (
          <div>
            <p className="text-[15px] font-medium text-tc-ink">{error}</p>
            <p className="mt-1 text-[13px] text-tc-muted">Pick another file to try again.</p>
          </div>
        )}

        {state === 'idle' && (
          <div>
            <p className="text-[15px] font-medium text-tc-ink">
              Drop a resume here, or <span className="text-tc-azure underline underline-offset-2">browse</span>
            </p>
            <p className="mt-1.5 text-[13px] text-tc-muted">PDF, DOCX, DOC, or TXT, up to 20 MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
