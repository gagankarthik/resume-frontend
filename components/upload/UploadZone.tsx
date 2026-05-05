'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

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
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError(null);
    if (rejected.length > 0) {
      setError(rejected[0].errors[0]?.message ?? 'Invalid file');
      return;
    }
    if (accepted.length > 0) {
      setPreview(accepted[0].name);
      onUpload(accepted[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center gap-4 p-12 text-center
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : error
              ? 'border-red-400 bg-red-50'
              : preview
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isDragActive ? 'bg-blue-100' : error ? 'bg-red-100' : preview ? 'bg-green-100' : 'bg-white shadow-md'
        }`}>
          {error
            ? <FiAlertCircle className="text-red-500" size={36} />
            : preview
              ? <FiCheckCircle className="text-green-500" size={36} />
              : isDragActive
                ? <FiUploadCloud className="text-blue-500 animate-bounce" size={36} />
                : <FiUploadCloud className="text-blue-400" size={36} />
          }
        </div>

        {/* Text */}
        {preview ? (
          <div>
            <div className="flex items-center justify-center gap-2 text-green-700 font-semibold text-lg">
              <FiFile size={18} />
              {preview}
            </div>
            <p className="text-green-600 text-sm mt-1">Ready to process — extracting now…</p>
          </div>
        ) : isDragActive ? (
          <div>
            <p className="text-blue-600 font-semibold text-lg">Drop it here!</p>
            <p className="text-blue-500 text-sm mt-1">We&apos;ll handle the rest</p>
          </div>
        ) : error ? (
          <div>
            <p className="text-red-600 font-semibold">Upload failed</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <p className="text-gray-500 text-xs mt-2">Try a different file</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 font-semibold text-lg">Drag & drop your resume</p>
            <p className="text-gray-500 text-sm mt-1">or <span className="text-blue-600 font-medium underline underline-offset-2">click to browse</span></p>
            <p className="text-gray-400 text-xs mt-3">PDF, DOCX, DOC, TXT — up to 20 MB</p>
          </div>
        )}
      </div>

      {/* Format badges */}
      {!preview && !error && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {['PDF', 'DOCX', 'DOC', 'TXT'].map(fmt => (
            <span key={fmt} className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-500 shadow-sm">
              {fmt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
