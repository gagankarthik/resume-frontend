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
