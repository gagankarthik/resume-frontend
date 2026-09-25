'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Map as MLMap } from 'maplibre-gl';
import FilterPanel from './FilterPanel';
import CompanyDrawer from './CompanyDrawer';
import TalentTable from './TalentTable';
import AddResumes from './AddResumes';
import { STATUS_COLOR } from './colors';
import {
  exportUrl,
  fetchMapStyle,
  fetchTalentMap,
  importStatuses,
  listSavedSearches,
  removeSavedSearch,
  saveSearch,
  type Basemap,
  type SavedSearch,
} from '@/lib/talent/client';
import type { LayerView } from './TalentMap';
import { CLIENT_STATUS_LABEL, type ClientStatus, type MapResponse, type Mode, type TalentFilters } from '@/lib/talent/types';

const TalentMap = dynamic(() => import('./TalentMap'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center text-[14px] text-tc-muted">Loading the map…</div>,
});

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-tc-line bg-tc-desk p-0.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3.5 py-1.5 text-[13.5px] font-medium transition-colors ${
            value === o.value ? 'bg-white text-tc-ink shadow-[0_1px_2px_rgba(12,27,51,0.12)]' : 'text-tc-muted hover:text-tc-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Menu({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-tc-line-2 bg-white px-3 text-[13.5px] font-medium text-tc-ink hover:bg-tc-desk"
      >
        {label}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-64 overflow-hidden rounded-lg border border-tc-line bg-white py-1 shadow-[0_16px_36px_-16px_rgba(12,27,51,0.35)]">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const menuItem = 'block w-full px-3.5 py-2 text-left text-[13.5px] text-tc-ink hover:bg-tc-desk';

export default function TalentWorkspace() {
  const [mode, setMode] = useState<Mode>('recruiting');
  const [view, setView] = useState<'map' | 'table'>('map');
  const [filters, setFilters] = useState<TalentFilters>({});
  const [data, setData] = useState<MapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [styleUrl, setStyleUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>('light');
  const [layers, setLayers] = useState<LayerView>('both');
  const [refresh, setRefresh] = useState(0);
  const mapRef = useRef<MLMap | null>(null);
  const firstLoad = useRef(true);
  const statusFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listSavedSearches().then(setSearches).catch(() => {});
  }, []);

  useEffect(() => {
    fetchMapStyle(basemap)
      .then(s => setStyleUrl(s.styleUrl))
      .catch(e => setError(e instanceof Error ? e.message : String(e)));
  }, [basemap]);

  // Desktop folds the sidebar away; smaller screens slide it over the map.
  const toggleFilters = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) setCollapsed(v => !v);
    else setShowFilters(v => !v);
  };

  // Refetch on any filter or mode change, lightly debounced for typing.
  useEffect(() => {
    let alive = true;
    const id = setTimeout(() => {
      setLoading(true);
      fetchTalentMap(filters, mode, firstLoad.current)
        .then(d => {
          if (!alive) return;
          setData(d);
          setError(null);
          firstLoad.current = false;
        })
        .catch(e => alive && setError(e instanceof Error ? e.message : 'The talent map could not be loaded.'))
        .finally(() => alive && setLoading(false));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [filters, mode, refresh]);

  const reload = useCallback(() => setRefresh(r => r + 1), []);

  // Resumes uploaded in another tab appear as soon as you come back to this one.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && reload();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(n => (n === msg ? null : n)), 5000);
  };

  const downloadPng = () => {
    const map = mapRef.current;
    if (!map) return;
    const a = document.createElement('a');
    a.href = map.getCanvas().toDataURL('image/png');
    a.download = `talent-map-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  const [searchName, setSearchName] = useState('');
  const onSaveSearch = async () => {
    const name = searchName.trim();
    if (!name) return;
    try {
      const s = await saveSearch(name, mode, filters);
      setSearchName('');
      setSearches(list => [s, ...list]);
      flash(`Saved “${s.name}”.`);
    } catch (e) {
      flash(e instanceof Error ? e.message : 'The search could not be saved.');
    }
  };

  const empty = data && data.total === 0 && !Object.keys(filters).some(k => (filters as Record<string, unknown>)[k] != null);

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-tc-line bg-white px-4 py-3 sm:px-6">
        <h1 className="mr-2 text-[18px] font-bold tracking-[-0.02em] text-tc-ink">Talent map</h1>
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'recruiting', label: 'Recruiting' },
            { value: 'sales', label: 'Sales' },
          ]}
        />
        <Segmented
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: 'map', label: 'Map' },
            { value: 'table', label: 'Table' },
          ]}
        />
        <button
          type="button"
          onClick={toggleFilters}
          aria-controls="tm-filters"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-tc-line-2 bg-white px-3 text-[13.5px] font-medium text-tc-ink hover:bg-tc-desk"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 4h12M4.5 8h7M6.5 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="lg:hidden">Filters</span>
          <span className="hidden lg:inline">{collapsed ? 'Show filters' : 'Hide filters'}</span>
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Menu label="Saved searches">
            {close => (
              <>
                <form className="flex gap-2 px-3 py-2" onSubmit={e => { e.preventDefault(); void onSaveSearch(); close(); }}>
                  <input className="gov-input !py-1.5" placeholder="Name this search" aria-label="Search name" value={searchName} onChange={e => setSearchName(e.target.value)} />
                  <button type="submit" disabled={!searchName.trim()} className="rounded-md bg-tc-ink px-3 text-[13px] font-medium text-white disabled:opacity-50">
                    Save
                  </button>
                </form>
                {searches.length > 0 && <div className="my-1 border-t border-tc-line" />}
                {searches.map(s => (
                  <div key={s.id} className="flex items-center hover:bg-tc-desk">
                    <button type="button" className="flex-1 truncate px-3.5 py-2 text-left text-[13.5px] text-tc-ink" onClick={() => { setMode(s.mode); setFilters(s.filters); close(); }}>
                      {s.name}
                      <span className="ml-1.5 text-[12px] capitalize text-tc-faint">{s.mode}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${s.name}`}
                      className="px-3 py-2 text-tc-faint hover:text-tc-rose"
                      onClick={() => { void removeSavedSearch(s.id); setSearches(l => l.filter(x => x.id !== s.id)); }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </>
            )}
          </Menu>

          <Menu label="Export">
            {close => (
              <>
                <a className={menuItem} href={exportUrl('xlsx', mode, filters)} onClick={close}>Excel report (.xlsx)</a>
                <a className={menuItem} href={exportUrl('csv', mode, filters)} onClick={close}>CSV</a>
                <button type="button" className={menuItem} disabled={view !== 'map'} onClick={() => { downloadPng(); close(); }}>
                  Map image (.png){view !== 'map' ? ' — switch to Map' : ''}
                </button>
              </>
            )}
          </Menu>

          {mode === 'sales' && (
            <Menu label="Client status">
              {close => (
                <>
                  <button type="button" className={menuItem} onClick={() => { close(); window.location.href = '/api/talent/companies/import'; }}>Download the Excel template</button>
                  <button type="button" className={menuItem} onClick={() => { close(); statusFile.current?.click(); }}>
                    Upload the filled-in template
                  </button>
                </>
              )}
            </Menu>
          )}
          <input
            ref={statusFile}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={async e => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              try {
                const r = await importStatuses(f);
                flash(`Updated ${r.updated} companies${r.skipped ? `, skipped ${r.skipped} rows` : ''}.`);
                reload();
              } catch (err) {
                flash(err instanceof Error ? err.message : 'The file could not be imported.');
              }
            }}
          />

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-tc-azure px-3.5 text-[13.5px] font-semibold text-white hover:bg-tc-azure-d"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Add resumes
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Filters */}
        <div
          id="tm-filters"
          className={`${showFilters ? 'absolute inset-y-0 left-0 z-30 w-[min(320px,88vw)] shadow-xl' : 'hidden'} border-r border-tc-line bg-white lg:static lg:shrink-0 lg:shadow-none ${collapsed ? 'lg:hidden' : 'lg:block lg:w-[300px]'}`}
        >
          <FilterPanel onCollapse={toggleFilters} mode={mode} filters={filters} onChange={setFilters} facets={data?.facets ?? null} companyNames={data?.companyNames ?? {}} />
        </div>

        {/* Main */}
        <div className="relative min-w-0 flex-1 bg-tc-desk">
          {error && (
            <div className="absolute left-1/2 top-4 z-20 w-[min(92%,520px)] -translate-x-1/2 rounded-lg border border-tc-rose/30 bg-white px-4 py-3 text-[14px] text-tc-ink shadow-lg">
              {error}
            </div>
          )}

          {view === 'map' ? (
            <>
              {styleUrl && (
                <TalentMap
                  styleUrl={styleUrl}
                  data={data}
                  mode={mode}
                  radius={filters.radius}
                  selected={selected}
                  onSelect={setSelected}
                  layers={layers}
                  onReady={m => { mapRef.current = m; }}
                />
              )}
              {/* Nothing mapped yet: the map stays, with the way to fill it on top. */}
              {empty && (
                <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-6">
                  <div className="pointer-events-auto max-w-sm rounded-2xl border border-tc-line bg-white/95 p-6 text-center shadow-[0_24px_60px_-24px_rgba(12,27,51,0.45)] backdrop-blur">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-tc-azure/10 text-tc-azure">
                      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M2.5 5.5 7 3.5l6 2 4.5-2v11L13 16.5l-6-2-4.5 2v-11Z" />
                        <path d="M7 3.5v11M13 5.5v11" />
                      </svg>
                    </span>
                    <h2 className="mt-4 text-[18px] font-bold tracking-[-0.02em] text-tc-ink">No candidates on the map yet</h2>
                    <p className="mt-2 text-[14px] leading-[1.55] text-tc-muted">
                      Every resume you upload appears here automatically. Add the resumes you already have to start now.
                    </p>
                    <button type="button" onClick={() => setAdding(true)} className="mt-5 rounded-md bg-tc-azure px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-tc-azure-d">
                      Add resumes
                    </button>
                  </div>
                </div>
              )}

              {/* Map views */}
              <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
                {collapsed && (
                  <button
                    type="button"
                    onClick={toggleFilters}
                    aria-label="Show filters"
                    title="Show filters"
                    className="hidden h-[34px] w-[34px] place-items-center rounded-lg border border-tc-line bg-white/95 text-tc-muted shadow-[0_6px_18px_-10px_rgba(12,27,51,0.35)] hover:text-tc-ink lg:grid"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <rect x="2" y="2.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M6 2.5v11" stroke="currentColor" strokeWidth="1.3" />
                      <path d="m8.8 6.2 1.8 1.8-1.8 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <div role="radiogroup" aria-label="Map layers" className="inline-flex rounded-lg border border-tc-line bg-white/95 p-0.5 shadow-[0_6px_18px_-10px_rgba(12,27,51,0.35)] backdrop-blur">
                  {([
                    ['both', 'Heat + companies'],
                    ['heat', 'Heat'],
                    ['companies', 'Companies'],
                  ] as [LayerView, string][]).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={layers === v}
                      onClick={() => setLayers(v)}
                      className={`rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                        layers === v ? 'bg-tc-ink text-white' : 'text-tc-muted hover:text-tc-ink'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 rounded-lg border border-tc-line bg-white/95 py-0.5 pl-2.5 pr-1 text-[12.5px] font-medium text-tc-muted shadow-[0_6px_18px_-10px_rgba(12,27,51,0.35)] backdrop-blur">
                  Basemap
                  <select
                    value={basemap}
                    onChange={e => setBasemap(e.target.value as Basemap)}
                    className="rounded-md bg-transparent py-1 pr-1 text-[12.5px] font-medium text-tc-ink outline-none"
                  >
                    <option value="light">Light</option>
                    <option value="streets">Streets</option>
                    <option value="dark">Dark</option>
                    <option value="satellite">Satellite</option>
                  </select>
                </label>
              </div>

              {/* Summary and legend */}
              {data && (
                <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[calc(100%-2rem)] rounded-xl border border-tc-line bg-white/95 px-4 py-3 shadow-[0_10px_30px_-16px_rgba(12,27,51,0.4)] backdrop-blur">
                  <p className="text-[14px] text-tc-ink">
                    <strong className="tabular-nums">{data.total.toLocaleString()}</strong> candidates
                    <span className="text-tc-muted"> · {data.points.length.toLocaleString()} employer sites</span>
                    {loading && <span className="ml-2 text-tc-faint">Updating…</span>}
                  </p>
                  {data.hidden.companies > 0 && (
                    <p className="mt-0.5 text-[12.5px] text-tc-muted">
                      {data.hidden.companies} companies with fewer than {data.minCount} candidates are hidden.
                    </p>
                  )}
                  {mode === 'sales' ? (
                    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-tc-muted">
                      {(Object.keys(STATUS_COLOR) as ClientStatus[]).map(s => (
                        <li key={s} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                          {CLIENT_STATUS_LABEL[s]}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 text-[12px] text-tc-muted">
                      Fewer
                      <span className="h-2 w-28 rounded-full" style={{ background: 'linear-gradient(90deg, #7ED3EA, #1AA3C8, #2A45D8, #5B2BB5, #B4237A)' }} />
                      More
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-white">
              <TalentTable rows={data?.companies ?? []} mode={mode} onOpen={setSelected} />
            </div>
          )}

          {selected && (
            <CompanyDrawer
              key={selected}
              companyKey={selected}
              filters={filters}
              mode={mode}
              onClose={() => setSelected(null)}
              onChanged={reload}
            />
          )}

          {notice && (
            <div role="status" className="absolute right-4 top-4 z-30 rounded-lg bg-tc-ink px-4 py-2.5 text-[13.5px] text-white shadow-lg">
              {notice}
            </div>
          )}
        </div>
      </div>

      {adding && <AddResumes onClose={() => setAdding(false)} onDone={reload} />}
    </div>
  );
}
