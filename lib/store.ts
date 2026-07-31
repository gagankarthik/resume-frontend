import type { APIResponse } from './types';

const KEY = 'resume_data';

export function saveResume(data: APIResponse): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadResume(): APIResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as APIResponse;
  } catch {
    return null;
  }
}

export function clearResume(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

// ── Job draft (matching) ────────────────────────────────────────────────────
// The pasted job description stays in the browser, like the resume record: a
// recruiter can leave the page mid-search and come back to it.

const JOB_KEY = 'match_job';

export function saveJobDraft(text: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(JOB_KEY, text);
}

export function loadJobDraft(): string {
  if (typeof window === 'undefined') return '';
  const raw = localStorage.getItem(JOB_KEY) ?? '';
  // Drafts written by the earlier title-plus-text form were JSON; unwrap one
  // rather than dropping the description into the box as source code.
  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as { text?: unknown };
      return typeof parsed.text === 'string' ? parsed.text : '';
    } catch {
      return raw;
    }
  }
  return raw;
}

// ── Uploaded resume set (matching) ──────────────────────────────────────────
// Which files this browser has made searchable. The set itself lives in the
// matching engine; this is the local record of it, so the list survives a
// reload and a half-finished upload can be picked up where it stopped.

const BATCH_KEY = 'match_batch';

export type BatchStatus = 'queued' | 'working' | 'indexed' | 'skipped' | 'failed';

export interface BatchItem {
  resumeId: string;
  filename: string;
  status: BatchStatus;
  error?: string;
}

export function saveBatch(items: BatchItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BATCH_KEY, JSON.stringify(items));
}

export function loadBatch(): BatchItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BATCH_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BatchItem[];
    if (!Array.isArray(parsed)) return [];
    // A run interrupted by a closed tab left items mid-flight; they are work
    // still to do, not work that failed.
    return parsed.map(item =>
      item.status === 'working' ? { ...item, status: 'queued' as const } : item,
    );
  } catch {
    return [];
  }
}
