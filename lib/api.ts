import type { APIResponse } from './types';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export async function extractResume(file: File): Promise<APIResponse> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/extract`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<APIResponse>;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
