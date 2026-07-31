'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { APIResponse } from '@/lib/types';
import { loadResume, saveResume } from '@/lib/store';
import { mapToResumeData } from '@/lib/mapper';
import ResumeEditor from '@/components/editor/ResumeEditor';
import ResumePreview from '@/components/formats/ResumePreview';
import {
  IconCheckCircle,
  IconSave,
  IconUpload,
  IconSplit,
  IconPreview,
  IconEdit,
  IconPrint,
  IconDownload,
} from '@/components/ui/icons';
import AppHeader from '@/components/app/AppHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import StateDownloadDialog from '@/components/formats/StateDownloadDialog';

type StateFormat = 'ohio' | 'pennsylvania' | 'oceanblue' | 'georgia';
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
    <div className="flex h-screen flex-col overflow-hidden bg-tc-desk">

      {/* ── Header ── */}
      <AppHeader step="Review" dense>
        {/* Panel mode — desktop only (mobile uses bottom tabs) */}
        <div className="hidden items-center gap-0.5 rounded-lg bg-tc-desk p-1 md:flex">
          {([
            { id: 'editor',  label: 'Edit',    Icon: IconEdit  },
            { id: 'split',   label: 'Split',   Icon: IconSplit },
            { id: 'preview', label: 'Preview', Icon: IconPreview    },
          ] as { id: PanelMode; label: string; Icon: React.FC<{ size?: number }> }[]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setPanel(id)}
              aria-pressed={panel === id}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                panel === id
                  ? 'bg-white text-tc-ink shadow-[0_1px_2px_rgba(11,27,51,0.10)]'
                  : 'text-tc-muted hover:text-tc-ink'
              }`}
            >
              <Icon size={12} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Save status */}
        <span
          className={`flex shrink-0 items-center gap-1.5 px-1 text-[12.5px] font-medium ${
            saved ? 'text-tc-mint' : 'text-tc-faint'
          }`}
        >
          {saved ? <IconCheckCircle size={13} /> : <IconSave size={13} className="animate-pulse" />}
          <span className="hidden sm:inline">{saved ? 'Saved' : 'Saving…'}</span>
        </span>

        {candidateName && (
          <span className="hidden max-w-[160px] items-center rounded-md bg-tc-desk px-2.5 py-1 text-[12.5px] text-tc-muted lg:flex">
            <span className="truncate">{candidateName}</span>
          </span>
        )}

        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <IconPrint size={13} />
          <span className="hidden sm:inline">Print</span>
        </Button>

        <Button size="sm" onClick={() => setDlgOpen(true)}>
          <IconDownload size={13} />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <ButtonLink href="/upload" variant="ghost" size="sm">
          <IconUpload size={13} />
          <span className="hidden md:inline">New upload</span>
        </ButtonLink>
      </AppHeader>

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
                <option value="georgia">Georgia (GA Standard)</option>
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
          <IconEdit size={18} />
          <span>Edit</span>
        </button>
        <button
          onClick={() => setPanel('preview')}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[11px] font-semibold transition-colors ${
            effectivePanel === 'preview' ? 'text-gov-blue' : 'text-gov-gray-400'
          }`}
        >
          <IconPreview size={18} />
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
