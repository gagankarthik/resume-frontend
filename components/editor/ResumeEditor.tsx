'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { APIResponse } from '@/lib/types';
import PersonalInfoEditor from './sections/PersonalInfoEditor';
import SummaryEditor from './sections/SummaryEditor';
import WorkExperienceEditor from './sections/WorkExperienceEditor';
import EducationEditor from './sections/EducationEditor';
import SkillsEditor from './sections/SkillsEditor';
import CertificationsEditor from './sections/CertificationsEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import { Button } from '@/components/ui/Button';
import { IconAlert, IconArrowLeft, IconArrowRight, IconDownload } from '@/components/ui/icons';

/**
 * The review pass, one section at a time.
 *
 * Checking an extracted resume is a sequence, not a dashboard: name and
 * contact, then the summary, then each job. So the page shows one section,
 * says where you are in the run, and moves you on — instead of putting eight
 * panels on screen and leaving you to work out which you have looked at.
 */

interface Props {
  data: APIResponse;
  onChange: (data: APIResponse) => void;
  /** Offered at the end of the run. */
  onExport: () => void;
  /**
   * What this record is, shown at the end of the tab row: the file it came
   * from, or the candidate's name when the extraction didn't report one.
   */
  label?: string;
  /** Autosave state, shown beside the tabs. */
  saved?: boolean;
  /**
   * Where the tab strip sticks. Beside the preview each pane scrolls on its
   * own, so the strip pins to the top of the pane; on the plain page it has to
   * clear the site header.
   */
  stickyUnderHeader?: boolean;
}

type SectionId =
  | 'personal'
  | 'summary'
  | 'work'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects';

const SECTIONS: {
  id: SectionId;
  label: string;
  short: string;
  count?: (d: APIResponse) => number;
}[] = [
  { id: 'personal',       label: 'Personal info',   short: 'Personal' },
  { id: 'summary',        label: 'Summary',         short: 'Summary' },
  { id: 'work',           label: 'Work experience', short: 'Experience',  count: d => d.work_experience?.length ?? 0 },
  { id: 'education',      label: 'Education',       short: 'Education',   count: d => d.education?.length ?? 0 },
  { id: 'skills',         label: 'Skills',          short: 'Skills' },
  { id: 'certifications', label: 'Certifications',  short: 'Certs',       count: d => d.certifications?.length ?? 0 },
  { id: 'projects',       label: 'Projects',        short: 'Projects',    count: d => d.projects?.length ?? 0 },
];

/**
 * What the extraction pass reported about itself: how much of the source it
 * captured, and anything it dropped. Shown only when there is something to act
 * on, and only on the first section — it is about the whole document.
 */
function AuditNote({ data }: { data: APIResponse }) {
  const [open, setOpen] = useState(false);
  const audit = data._metadata?.audit;
  if (!audit) return null;

  const coverage = audit.coverage_percent;
  const warnings = audit.warnings ?? [];
  const missed = audit.missed_lines ?? [];
  if (!((coverage !== undefined && coverage < 95) || warnings.length > 0 || missed.length > 0)) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-tc-amber/30 bg-tc-amber/[0.05] px-4 py-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2 text-left text-[13px] font-medium text-tc-ink"
      >
        <IconAlert size={14} className="shrink-0 text-tc-amber" />
        <span className="flex-1">
          {coverage !== undefined ? `${coverage}% of the resume was captured` : 'Extraction check'}
          {warnings.length > 0 && ` · ${warnings.length} warning${warnings.length > 1 ? 's' : ''}`}
        </span>
        <span className="text-[12.5px] font-normal text-tc-muted underline underline-offset-2">
          {open ? 'Hide' : 'Details'}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-1.5 text-[12.5px] leading-relaxed text-tc-muted">
          {warnings.map((w, i) => (
            <p key={`w${i}`}>· {w}</p>
          ))}
          {missed.length > 0 && (
            <>
              <p className="pt-1 font-medium text-tc-ink">Lines that may be missing:</p>
              {missed.map((m, i) => (
                <p key={`m${i}`} className="truncate">
                  – {m}
                </p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResumeEditor({
  data,
  onChange,
  onExport,
  label,
  saved = true,
  stickyUnderHeader = true,
}: Props) {
  const [step, setStep] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLOListElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [overflow, setOverflow] = useState({ left: false, right: false });
  const section = SECTIONS[step];
  const last = step === SECTIONS.length - 1;

  // Beside the preview the pane is narrow and the row of tabs runs off the
  // end. Rather than let them disappear silently, keep the selected tab in
  // view and fade the edge that still has tabs behind it.
  const measure = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    setOverflow({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = strip.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    tabs.current[step]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [step]);

  const go = (next: number) => {
    setStep(next);
    // Whichever is doing the scrolling — the page, or this pane beside the
    // preview — put the top of the new section in view.
    scroller.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const body = () => {
    switch (section.id) {
      case 'personal':       return <PersonalInfoEditor data={data} onChange={onChange} />;
      case 'summary':        return <SummaryEditor data={data} onChange={onChange} />;
      case 'work':           return <WorkExperienceEditor data={data} onChange={onChange} />;
      case 'education':      return <EducationEditor data={data} onChange={onChange} />;
      case 'skills':         return <SkillsEditor data={data} onChange={onChange} />;
      case 'certifications': return <CertificationsEditor data={data} onChange={onChange} />;
      case 'projects':       return <ProjectsEditor data={data} onChange={onChange} />;
    }
  };

  return (
    <div ref={scroller}>
      {/* The sections, as tabs. They stay on screen while you work down a
          section, and scroll sideways rather than wrapping when the pane is
          narrow — the row is always one line, always in the same place. */}
      <div
        className={`sticky z-20 border-b border-tc-line bg-white/95 backdrop-blur ${
          stickyUnderHeader ? 'top-16' : 'top-0'
        }`}
      >
        <div className="mx-auto flex max-w-[880px] items-center gap-3 px-4 sm:px-6">
          <nav aria-label="Resume sections" className="relative -mb-px min-w-0 flex-1">
            <ol
              ref={strip}
              role="tablist"
              onScroll={measure}
              className="flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {SECTIONS.map((s, i) => {
                const count = s.count?.(data);
                const current = i === step;
                return (
                  <li key={s.id} className="shrink-0">
                    <button
                      ref={el => {
                        tabs.current[i] = el;
                      }}
                      role="tab"
                      aria-selected={current}
                      onClick={() => go(i)}
                      className={`relative flex items-center gap-1.5 px-2.5 py-3.5 text-[13px] font-medium transition-colors sm:px-3 ${
                        current ? 'text-tc-ink' : 'text-tc-muted hover:text-tc-ink'
                      }`}
                    >
                      {s.short}
                      {count !== undefined && count > 0 && (
                        <span
                          className={`rounded px-1 text-[10.5px] font-semibold ${
                            current ? 'bg-tc-azure/[0.12] text-tc-azure' : 'bg-tc-desk-2 text-tc-muted'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      {current && (
                        <span className="absolute inset-x-1.5 bottom-0 h-[2px] rounded-full bg-tc-azure" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* There are more tabs that way. */}
            {overflow.left && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent"
              />
            )}
            {overflow.right && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"
              />
            )}
          </nav>

          <span className="hidden shrink-0 items-center gap-2 text-[12.5px] text-tc-faint lg:flex">
            {label && (
              <span
                // A filename reads as data, a person's name reads as prose.
                className={`max-w-[140px] truncate ${
                  label.includes('.') ? 'font-mono text-[11.5px]' : ''
                }`}
                title={label}
              >
                {label}
              </span>
            )}
            <span className={saved ? 'text-tc-faint' : 'text-tc-azure'}>
              {saved ? 'Saved' : 'Saving…'}
            </span>
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[880px] px-4 py-7 sm:px-6 lg:py-9">
        {step === 0 && <AuditNote data={data} />}
        {body()}

        {/* Move on */}
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-tc-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          {/* On the first section there is nowhere to go back to: the button
              holds its place on a wide screen and disappears on a narrow one. */}
          <div className={step === 0 ? 'hidden sm:block sm:invisible' : ''}>
            <Button variant="secondary" onClick={() => go(step - 1)} disabled={step === 0}>
              <IconArrowLeft size={14} />
              <span className="truncate">{SECTIONS[Math.max(step - 1, 0)].label}</span>
            </Button>
          </div>

          {last ? (
            <Button onClick={onExport} className="w-full sm:w-auto">
              <IconDownload size={14} />
              Export
            </Button>
          ) : (
            <Button onClick={() => go(step + 1)} className="w-full sm:w-auto">
              <span className="truncate">{SECTIONS[step + 1].label}</span>
              <IconArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
