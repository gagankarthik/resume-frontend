'use client';

import React, { useState } from 'react';
import { FiX, FiDownload, FiPrinter } from 'react-icons/fi';
import type { ResumeData } from '@/lib/types';

type StateOption = 'ohio' | 'pennsylvania' | 'oceanblue' | 'georgia';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  defaultFormat?: StateOption;
}

const StateDownloadDialog: React.FC<Props> = ({ isOpen, onClose, resumeData, defaultFormat = 'ohio' }) => {
  const [selected, setSelected] = useState<StateOption>(defaultFormat);

  React.useEffect(() => {
    if (isOpen) setSelected(defaultFormat);
  }, [isOpen, defaultFormat]);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadDocx = async () => {
    setDownloading(true);
    setError(null);
    try {
      if (selected === 'ohio') {
        const { buildOhioDocx } = await import('@/lib/docx');
        await buildOhioDocx(resumeData);
      } else if (selected === 'pennsylvania') {
        const { buildPADocx } = await import('@/lib/docx');
        await buildPADocx(resumeData);
      } else if (selected === 'oceanblue') {
        const { buildOceanblueDocx } = await import('@/lib/docx');
        await buildOceanblueDocx(resumeData);
      } else if (selected === 'georgia') {
        const { buildGeorgiaDocx } = await import('@/lib/docx');
        await buildGeorgiaDocx(resumeData);
      }
    } catch (e) {
      console.error('DOCX generation failed', e);
      setError('Failed to generate document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gov-navy px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Export Resume</h2>
            <p className="text-blue-300/60 text-xs">Select format and download</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* State selector */}
          <div>
            <p className="text-xs font-bold text-gov-gray-500 uppercase tracking-widest mb-3">State Format</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'ohio' as StateOption, emoji: '🏛️', label: 'Ohio', sub: 'OH Standard' },
                { id: 'pennsylvania' as StateOption, emoji: '🔔', label: 'Pennsylvania', sub: 'PA Standard' },
                { id: 'georgia' as StateOption, emoji: '🍑', label: 'Georgia', sub: 'GA Standard' },
                { id: 'oceanblue' as StateOption, emoji: '🌊', label: 'Oceanblue', sub: 'ATS Standard' },
              ]).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selected === s.id
                      ? 'border-gov-blue bg-gov-blue-light text-gov-blue'
                      : 'border-gov-gray-200 hover:border-gov-gray-300 text-gov-gray-600'
                  }`}
                >
                  <span className="text-3xl mb-1.5">{s.emoji}</span>
                  <span className="font-bold text-sm">{s.label}</span>
                  <span className="text-xs text-gov-gray-400 mt-0.5">{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleDownloadDocx}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gov-blue hover:bg-gov-blue-mid disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors"
            >
              <FiDownload size={15} />
              {downloading ? 'Building document…' : 'Download Word (.docx)'}
            </button>
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gov-gray-100 hover:bg-gov-gray-200 text-gov-gray-700 rounded-lg font-semibold text-sm transition-colors"
            >
              <FiPrinter size={15} />
              Print / Save as PDF
            </button>
          </div>

          <p className="text-[11px] text-gov-gray-400 text-center">
            All extracted fields are included in the download.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StateDownloadDialog;
