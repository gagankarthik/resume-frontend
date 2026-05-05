'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UploadZone from '@/components/upload/UploadZone';
import { extractResume } from '@/lib/api';
import { saveResume } from '@/lib/store';
import { FiShield, FiLock, FiCheckCircle, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { OfficialSeal } from '@/components/landing/GovNav';

type Stage = 'idle' | 'extracting' | 'done' | 'error';

const STAGES = [
  { key: 'reading',     label: 'Reading document',          detail: 'Extracting raw text from file' },
  { key: 'parsing',     label: 'Parsing content',           detail: 'Identifying document structure' },
  { key: 'ai',          label: 'AI field extraction',       detail: 'Claude analyzing all resume sections' },
  { key: 'structuring', label: 'Structuring data',          detail: 'Organizing into 20+ schema fields' },
  { key: 'validating',  label: 'Validating output',         detail: 'Applying data quality checks' },
];

export default function UploadPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === 'extracting') {
      interval = setInterval(() => {
        setStageIndex(i => Math.min(i + 1, STAGES.length - 2));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const handleUpload = async (file: File) => {
    setError(null);
    setStage('extracting');
    setStageIndex(0);
    setFilename(file.name);

    try {
      const result = await extractResume(file);
      setStageIndex(STAGES.length - 1);
      setStage('done');
      saveResume(result);
      setTimeout(() => router.push('/editor'), 900);
    } catch (err) {
      setStage('error');
      setError(err instanceof Error ? err.message : 'Extraction failed. Check your connection and try again.');
    }
  };

  const reset = () => { setStage('idle'); setStageIndex(0); setError(null); };

  return (
    <div className="min-h-screen bg-gov-gray-50 flex flex-col">

      {/* Official header bar */}
      <div className="bg-gov-navy border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity">
            <FiArrowLeft size={14} className="text-slate-400" />
            <OfficialSeal size={28} />
            <div>
              <p className="text-white text-xs font-bold leading-tight">State Resume Processing</p>
              <p className="text-blue-400/70 text-[9px] tracking-widest uppercase">Document Upload</p>
            </div>
          </Link>
          <Link href="/editor" className="text-slate-400 hover:text-white text-xs font-medium transition-colors">
            Skip to Editor →
          </Link>
        </div>
      </div>

      {/* Gold accent rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-gov-gold/60 to-transparent" />

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

        {/* Main upload card */}
        <div>
          <div className="mb-7">
            <p className="text-gov-blue text-xs font-bold tracking-[0.15em] uppercase mb-2">Step 1 of 3 — Document Submission</p>
            <h1 className="text-2xl font-extrabold text-gov-gray-900 mb-1">Upload Resume Document</h1>
            <p className="text-gov-gray-600 text-sm">
              Submit your resume for AI-powered extraction and state-format conversion.
            </p>
          </div>

          {/* Upload zone card */}
          <div className="bg-white border border-gov-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="px-5 py-3.5 bg-gov-gray-50 border-b border-gov-gray-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gov-blue" />
              <p className="text-xs font-bold text-gov-gray-600 uppercase tracking-widest">Document Submission Portal</p>
            </div>

            <div className="p-6">
              {stage === 'idle' && <UploadZone onUpload={handleUpload} />}

              {stage === 'extracting' && (
                <div className="py-4">
                  {/* Spinner */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative w-20 h-20 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-gov-blue-light" />
                      <div className="absolute inset-0 rounded-full border-4 border-gov-blue border-t-transparent animate-spin" />
                      <div className="absolute inset-4 rounded-full bg-gov-blue-bg flex items-center justify-center">
                        <FiLock size={16} className="text-gov-blue" />
                      </div>
                    </div>
                    <p className="text-gov-gray-900 font-bold text-base">Processing Document</p>
                    <p className="text-gov-gray-400 text-sm mt-1 font-mono truncate max-w-[280px]">{filename}</p>
                  </div>

                  {/* Stage tracker */}
                  <div className="space-y-2">
                    {STAGES.map((s, i) => (
                      <div
                        key={s.key}
                        className={`flex items-center gap-4 px-4 py-3 rounded border transition-all ${
                          i < stageIndex
                            ? 'bg-gov-green-light border-gov-green/20 text-gov-green'
                            : i === stageIndex
                              ? 'bg-gov-blue-bg border-gov-blue/30 text-gov-blue'
                              : 'bg-gov-gray-50 border-gov-gray-200 text-gov-gray-400'
                        }`}
                      >
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                          {i < stageIndex ? (
                            <FiCheckCircle size={16} />
                          ) : i === stageIndex ? (
                            <div className="w-4 h-4 border-2 border-gov-blue border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-current opacity-30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight">{s.label}</p>
                          <p className="text-[11px] opacity-70">{s.detail}</p>
                        </div>
                        {i === stageIndex && (
                          <div className="flex gap-0.5">
                            {[0,1,2].map(j => (
                              <span key={j} className="w-1 h-1 bg-gov-blue rounded-full animate-bounce"
                                style={{ animationDelay: `${j * 0.18}s` }} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-center text-gov-gray-400 text-xs mt-5">
                    Do not close this window — processing in progress
                  </p>
                </div>
              )}

              {stage === 'done' && (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gov-green-light rounded-full flex items-center justify-center">
                    <FiCheckCircle size={28} className="text-gov-green" />
                  </div>
                  <p className="text-gov-gray-900 font-bold text-lg mb-1">Extraction Complete</p>
                  <p className="text-gov-green text-sm">Redirecting to the document editor…</p>
                </div>
              )}

              {stage === 'error' && (
                <div className="py-6">
                  <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded mb-5">
                    <FiAlertTriangle size={18} className="text-gov-red flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gov-red font-bold text-sm mb-1">Processing Failed</p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={reset}
                      className="px-5 py-2.5 bg-gov-blue hover:bg-gov-blue-mid text-white rounded text-sm font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                    <p className="text-gov-gray-400 text-xs">If the problem persists, contact support.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Accepted formats */}
          {stage === 'idle' && (
            <div className="mt-4 px-5 py-3 bg-white border border-gov-gray-200 rounded-lg flex items-center gap-3 flex-wrap">
              <p className="text-xs font-bold text-gov-gray-400 uppercase tracking-wide">Accepted formats:</p>
              {['PDF', 'DOCX', 'DOC', 'TXT'].map(f => (
                <span key={f} className="px-2.5 py-0.5 bg-gov-blue-light text-gov-blue text-xs font-bold rounded tracking-wide">
                  .{f.toLowerCase()}
                </span>
              ))}
              <span className="text-gov-gray-400 text-xs ml-auto">Max 20 MB</span>
            </div>
          )}
        </div>

        {/* Right sidebar — information */}
        <aside className="space-y-4">
          {/* Security notice */}
          <div className="bg-white border border-gov-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gov-navy flex items-center gap-2">
              <FiShield size={14} className="text-gov-gold" />
              <p className="text-white text-xs font-bold uppercase tracking-widest">System Security Notice</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: <FiLock size={14}/>, label: 'TLS 1.3 encrypted transmission' },
                { icon: <FiCheckCircle size={14}/>, label: 'No server-side data retention' },
                { icon: <FiShield size={14}/>, label: 'Local browser storage only' },
                { icon: <FiCheckCircle size={14}/>, label: 'WCAG 2.1 AA compliant interface' },
              ].map(({ icon, label }, i) => (
                <div key={i} className="flex items-center gap-2.5 text-gov-gray-600">
                  <span className="text-gov-green">{icon}</span>
                  <p className="text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Process steps */}
          <div className="bg-white border border-gov-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gov-gray-100">
              <p className="text-xs font-bold text-gov-gray-600 uppercase tracking-widest">After Upload</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { n: '2', label: 'Review all extracted fields in the editor' },
                { n: '3', label: 'Choose a state format and download' },
                { n: '4', label: 'Download formatted DOCX or print as PDF' },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gov-blue text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {n}
                  </span>
                  <p className="text-xs text-gov-gray-600 leading-relaxed">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="px-4 py-3 bg-gov-gold-light border border-gov-gold/20 rounded-lg">
            <p className="text-gov-gold font-bold text-xs uppercase tracking-wide mb-2">Processing Tip</p>
            <p className="text-gov-gray-700 text-xs leading-relaxed">
              For best results, use a text-based PDF or DOCX file. Scanned image PDFs require Tesseract OCR to be installed on the processing server.
            </p>
          </div>
        </aside>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gov-gray-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-gov-gray-400">
          <span>State Resume Processing System</span>
          <span>State Format Tool · Powered by AI</span>
        </div>
      </div>
    </div>
  );
}
