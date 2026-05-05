'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { APIResponse } from '@/lib/types';
import { loadResume, saveResume } from '@/lib/store';
import { mapToResumeData } from '@/lib/mapper';
import ResumeEditor from '@/components/editor/ResumeEditor';
import ResumePreview from '@/components/formats/ResumePreview';
import { FiCheckCircle, FiSave, FiUpload, FiLayout, FiEye, FiEdit3, FiPrinter, FiDownload } from 'react-icons/fi';
import { OfficialSeal } from '@/components/landing/GovNav';
import StateDownloadDialog from '@/components/formats/StateDownloadDialog';

type StateFormat = 'ohio' | 'pennsylvania' | 'oceanblue';
type PanelMode   = 'split' | 'editor' | 'preview';

export default function EditorPage() {
  const router = useRouter();
  const [apiData, setApiData]   = useState<APIResponse | null>(null);
  const [format, setFormat]     = useState<StateFormat>('ohio');
  const [saved, setSaved]       = useState(false);
  const [panel, setPanel]       = useState<PanelMode>('split');
  const [dlgOpen, setDlgOpen]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = loadResume();
    if (!data) { router.replace('/upload'); return; }
    setApiData(data);
  }, [router]);

  // Detect mobile and auto-collapse split mode
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile && panel === 'split') setPanel('editor');
  }, [isMobile, panel]);

  const handleChange = useCallback((updated: APIResponse) => {
    setApiData(updated);
    saveResume(updated);
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 700);
    return () => clearTimeout(t);
  }, []);

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSplitPct(Math.min(Math.max(((ev.clientX - rect.left) / rect.width) * 100, 25), 75));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  if (!apiData) {
    return (
      <div className="min-h-screen bg-gov-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gov-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-gov-gray-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  const resumeData = mapToResumeData(apiData);
  const candidateName = apiData.personal_information?.full_name ?? '';

  // On mobile, split collapses to editor
  const effectivePanel: PanelMode = isMobile && panel === 'split' ? 'editor' : panel;

  return (
    <div className="h-screen flex flex-col bg-gov-gray-50 overflow-hidden">

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-gov-navy border-b border-white/10 z-30">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gov-gold to-transparent" />
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <OfficialSeal size={28} />
            <div className="hidden sm:block">
              <p className="text-white text-xs font-bold leading-tight group-hover:text-blue-200 transition-colors">ResumeKit</p>
              <p className="text-blue-400/60 text-[9px] tracking-widest uppercase">State Format Tool</p>
            </div>
          </Link>

          <div className="h-6 w-px bg-white/10 flex-shrink-0" />

          {/* Panel mode — desktop only (mobile uses bottom tabs) */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded overflow-hidden">
            {([
              { id: 'editor',  label: 'Edit',    Icon: FiEdit3  },
              { id: 'split',   label: 'Split',   Icon: FiLayout },
              { id: 'preview', label: 'Preview', Icon: FiEye    },
            ] as { id: PanelMode; label: string; Icon: React.FC<{ size?: number }> }[]).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setPanel(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all ${
                  panel === id ? 'bg-gov-blue text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={12} />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded text-xs font-semibold transition-all"
          >
            <FiPrinter size={13} />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Export */}
          <button
            onClick={() => setDlgOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gov-blue hover:bg-gov-blue-mid text-white rounded text-xs font-bold transition-all shadow-md shadow-blue-900/30"
          >
            <FiDownload size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="flex-1" />

          {/* Save status */}
          <div className={`flex items-center gap-1 text-xs font-medium flex-shrink-0 transition-all ${saved ? 'text-gov-green' : 'text-slate-500'}`}>
            {saved
              ? <><FiCheckCircle size={13} /><span className="hidden sm:inline ml-1">Saved</span></>
              : <><FiSave size={13} className="animate-pulse" /><span className="hidden sm:inline ml-1">Saving…</span></>}
          </div>

          {/* Candidate name */}
          {candidateName && (
            <div className="hidden lg:flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-300 max-w-[160px]">
              <span className="truncate">{candidateName}</span>
            </div>
          )}

          {/* New upload */}
          <Link
            href="/upload"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded text-xs font-medium transition-all flex-shrink-0"
          >
            <FiUpload size={13} />
            <span className="hidden md:inline">New Upload</span>
          </Link>
        </div>
      </header>

      {/* ── Breadcrumb — desktop only ── */}
      <div className="hidden md:flex flex-shrink-0 px-4 py-1.5 bg-white border-b border-gov-gray-200 items-center gap-2 text-xs text-gov-gray-400">
        <Link href="/" className="hover:text-gov-blue transition-colors">Home</Link>
        <span>›</span>
        <Link href="/upload" className="hover:text-gov-blue transition-colors">Upload</Link>
        <span>›</span>
        <span className="text-gov-gray-700 font-medium">Edit Document</span>
      </div>

      {/* ── Main panels ── */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">

        {/* EDITOR PANEL */}
        {(effectivePanel === 'editor' || effectivePanel === 'split') && (
          <div
            className="bg-white border-r border-gov-gray-200 overflow-hidden flex flex-col min-w-0"
            style={effectivePanel === 'split' ? { width: `${splitPct}%`, flexShrink: 0 } : { flex: 1 }}
          >
            <div className="px-4 py-2 bg-gov-gray-50 border-b border-gov-gray-200 flex items-center gap-2 flex-shrink-0">
              <div className="w-1.5 h-4 bg-gov-blue rounded-full" />
              <p className="text-xs font-bold text-gov-gray-600 uppercase tracking-widest">Field Editor</p>
              <span className="text-gov-gray-300 text-xs hidden xl:inline">· auto-saves</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResumeEditor data={apiData} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* DRAG HANDLE — desktop split only */}
        {effectivePanel === 'split' && (
          <div
            onMouseDown={onDividerMouseDown}
            className="w-1.5 flex-shrink-0 bg-gov-gray-200 hover:bg-gov-blue cursor-col-resize transition-colors duration-150 relative group z-10"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {[0,1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white" />)}
            </div>
          </div>
        )}

        {/* PREVIEW PANEL */}
        {(effectivePanel === 'preview' || effectivePanel === 'split') && (
          <div className="flex-1 overflow-hidden flex flex-col bg-gov-gray-100 min-w-0">
            <div className="px-4 py-2 bg-gov-gray-50 border-b border-gov-gray-200 flex items-center gap-2 flex-shrink-0">
              <div className="w-1.5 h-4 bg-gov-gold rounded-full" />
              <p className="text-xs font-bold text-gov-gray-600 uppercase tracking-widest">Preview</p>
              <span className="text-gov-gray-300 text-xs hidden xl:inline">· live</span>
              <div className="flex-1" />
              <select
                value={format}
                onChange={e => setFormat(e.target.value as StateFormat)}
                className="text-[11px] font-semibold text-gov-gray-700 bg-white border border-gov-gray-200 rounded px-2 py-1 focus:outline-none focus:border-gov-blue cursor-pointer"
              >
                <option value="ohio">Ohio (VectorVMS)</option>
                <option value="pennsylvania">Pennsylvania (PeopleFluent)</option>
                <option value="oceanblue">Oceanblue (ATS)</option>
              </select>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResumePreview resumeData={resumeData} format={format} />
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="flex md:hidden flex-shrink-0 bg-white border-t border-gov-gray-200 safe-area-inset-bottom">
        <button
          onClick={() => setPanel('editor')}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[11px] font-semibold transition-colors ${
            effectivePanel !== 'preview' ? 'text-gov-blue' : 'text-gov-gray-400'
          }`}
        >
          <FiEdit3 size={18} />
          <span>Edit</span>
        </button>
        <button
          onClick={() => setPanel('preview')}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[11px] font-semibold transition-colors ${
            effectivePanel === 'preview' ? 'text-gov-blue' : 'text-gov-gray-400'
          }`}
        >
          <FiEye size={18} />
          <span>Preview</span>
        </button>
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
