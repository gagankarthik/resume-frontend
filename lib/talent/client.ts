import type { CompanyDetail, CompanyProfile, MapResponse, Mode, TalentFilters } from './types';

/** Browser-side calls to /api/talent/*. */

async function json<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail ?? fallback);
  }
  return res.json() as Promise<T>;
}

export async function fetchTalentMap(filters: TalentFilters, mode: Mode, audit = false): Promise<MapResponse> {
  const res = await fetch('/api/talent/map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, mode, audit }),
  });
  return json<MapResponse>(res, 'The talent map could not be loaded.');
}

export async function fetchCompany(key: string, filters: TalentFilters): Promise<CompanyDetail> {
  const res = await fetch(`/api/talent/companies/${encodeURIComponent(key)}?f=${encodeURIComponent(JSON.stringify(filters))}`);
  return json<CompanyDetail>(res, 'The company could not be loaded.');
}

export async function saveCompany(key: string, patch: Partial<CompanyProfile>): Promise<CompanyProfile> {
  const res = await fetch(`/api/talent/companies/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return json<CompanyProfile>(res, 'The company could not be saved.');
}

export async function importStatuses(file: File): Promise<{ updated: number; skipped: number }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/talent/companies/import', { method: 'POST', body: form });
  return json(res, 'The file could not be imported.');
}

export async function lookupPlace(q: string): Promise<{ lat: number; lng: number; label: string }> {
  const res = await fetch(`/api/talent/geocode?q=${encodeURIComponent(q)}`);
  return json(res, 'That place could not be found.');
}

export type Basemap = 'light' | 'streets' | 'dark' | 'satellite';

export async function fetchMapStyle(style: Basemap = 'light'): Promise<{ styleUrl: string; fallback: boolean }> {
  return json(await fetch(`/api/talent/map-style?style=${style}`), 'The map could not be loaded.');
}

export type SavedSearch = { id: string; name: string; mode: Mode; filters: TalentFilters; createdAt: string };

export async function listSavedSearches(): Promise<SavedSearch[]> {
  return json(await fetch('/api/talent/searches'), 'Saved searches could not be loaded.');
}

export async function saveSearch(name: string, mode: Mode, filters: TalentFilters): Promise<SavedSearch> {
  const res = await fetch('/api/talent/searches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mode, filters }),
  });
  return json(res, 'The search could not be saved.');
}

export async function removeSavedSearch(id: string): Promise<void> {
  await fetch(`/api/talent/searches?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export const exportUrl = (format: 'xlsx' | 'csv', mode: Mode, filters: TalentFilters) =>
  `/api/talent/export?format=${format}&mode=${mode}&f=${encodeURIComponent(JSON.stringify(filters))}`;
