'use client';

import { useState, type ReactNode } from 'react';
import { lookupPlace } from '@/lib/talent/client';
import {
  CLIENT_STATUS_LABEL,
  SENIORITIES,
  type ClientStatus,
  type MapResponse,
  type Mode,
  type TalentFilters,
} from '@/lib/talent/types';

function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-tc-line">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-[13.5px] font-semibold text-tc-ink"
      >
        {title}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className={`text-tc-faint transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function toggle<T>(list: T[] | undefined, v: T): T[] | undefined {
  const cur = list ?? [];
  const next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
  return next.length ? next : undefined;
}

function CheckList({
  items,
  selected,
  onToggle,
  limit = 8,
  label = (s: string) => s,
}: {
  items: { name: string; count: number }[];
  selected?: string[];
  onToggle: (name: string) => void;
  limit?: number;
  label?: (name: string) => string;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, limit);
  if (!items.length) return <p className="text-[13px] text-tc-faint">Nothing to filter yet.</p>;
  return (
    <div>
      <ul className="space-y-0.5">
        {shown.map(i => {
          const on = selected?.includes(i.name) ?? false;
          return (
            <li key={i.name}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-[13.5px] hover:bg-tc-desk">
                <input type="checkbox" checked={on} onChange={() => onToggle(i.name)} className="h-4 w-4 accent-[#2A45D8]" />
                <span className="min-w-0 flex-1 truncate text-tc-ink">{label(i.name)}</span>
                <span className="tabular-nums text-[12.5px] text-tc-faint">{i.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {items.length > limit && (
        <button type="button" onClick={() => setAll(a => !a)} className="mt-1.5 px-1.5 text-[13px] font-medium text-tc-azure">
          {all ? 'Show fewer' : `Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}

const chip = (on: boolean) =>
  `inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1 text-[13px] leading-5 transition-colors ${
    on ? 'border-tc-azure bg-tc-azure text-white' : 'border-tc-line-2 bg-white text-tc-ink hover:border-tc-faint'
  }`;

export default function FilterPanel({
  mode,
  filters,
  onChange,
  facets,
  companyNames,
  onCollapse,
}: {
  onCollapse?: () => void;
  mode: Mode;
  filters: TalentFilters;
  onChange: (f: TalentFilters) => void;
  facets: MapResponse['facets'] | null;
  companyNames: Record<string, string>;
}) {
  const set = (patch: Partial<TalentFilters>) => onChange({ ...filters, ...patch });
  const [skillText, setSkillText] = useState('');
  const [place, setPlace] = useState(filters.radius?.label ?? '');
  const [miles, setMiles] = useState(filters.radius?.miles ?? 50);
  const [placeErr, setPlaceErr] = useState<string | null>(null);
  const [placeBusy, setPlaceBusy] = useState(false);
  const [companyText, setCompanyText] = useState('');

  const addSkill = (s: string) => {
    const v = s.trim();
    if (!v) return;
    const match = facets?.skills.find(x => x.name.toLowerCase() === v.toLowerCase())?.name ?? v;
    if (!(filters.skills ?? []).includes(match)) set({ skills: [...(filters.skills ?? []), match] });
    setSkillText('');
  };

  const applyRadius = async () => {
    if (!place.trim()) {
      set({ radius: undefined });
      return;
    }
    setPlaceBusy(true);
    setPlaceErr(null);
    try {
      const hit = await lookupPlace(place);
      set({ radius: { lat: hit.lat, lng: hit.lng, miles, label: hit.label } });
      setPlace(hit.label);
    } catch (e) {
      setPlaceErr(e instanceof Error ? e.message : 'That place could not be found.');
    } finally {
      setPlaceBusy(false);
    }
  };

  const companyMatches = companyText.trim()
    ? (facets?.companies ?? [])
        .filter(c => (companyNames[c.name] ?? c.name).toLowerCase().includes(companyText.toLowerCase()))
        .slice(0, 8)
    : [];

  const active =
    Object.entries(filters).filter(([k, v]) => k !== 'skillMatch' && v != null && !(Array.isArray(v) && !v.length) && v !== false).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-tc-line px-4 py-3">
        <p className="text-[14px] font-semibold text-tc-ink">
          Filters{active ? <span className="ml-1.5 rounded-full bg-tc-azure px-1.5 py-0.5 text-[11px] text-white">{active}</span> : null}
        </p>
        <div className="flex items-center gap-3">
          {active > 0 && (
            <button type="button" onClick={() => { onChange({}); setPlace(''); }} className="text-[13px] font-medium text-tc-azure">
              Clear all
            </button>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Hide filters"
              title="Hide filters"
              className="grid h-7 w-7 place-items-center rounded-md text-tc-muted transition-colors hover:bg-tc-desk hover:text-tc-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="2" y="2.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 2.5v11" stroke="currentColor" strokeWidth="1.3" />
                <path d="m10.5 6.2-1.8 1.8 1.8 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Title family">
          <CheckList
            items={facets?.families ?? []}
            selected={filters.families}
            onToggle={n => set({ families: toggle(filters.families, n) })}
          />
          <input
            className="gov-input mt-3"
            placeholder="Title contains…"
            value={filters.keyword ?? ''}
            onChange={e => set({ keyword: e.target.value || undefined })}
          />
        </Section>

        <Section title="Skills">
          <div className="flex gap-2">
            <input
              className="gov-input"
              placeholder="e.g. Java, Azure"
              list="tm-skill-list"
              value={skillText}
              onChange={e => setSkillText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillText); } }}
            />
            <button type="button" onClick={() => addSkill(skillText)} className="rounded-md border border-tc-line-2 px-3 text-[13px] font-medium text-tc-ink hover:bg-tc-desk">
              Add
            </button>
          </div>
          <datalist id="tm-skill-list">
            {(facets?.skills ?? []).map(s => <option key={s.name} value={s.name} />)}
          </datalist>
          {(filters.skills ?? []).length > 0 && (
            <>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {filters.skills!.map(s => (
                  <li key={s}>
                    <button type="button" onClick={() => set({ skills: toggle(filters.skills, s) })} className="flex items-center gap-1 rounded-full bg-tc-azure/10 px-2.5 py-1 text-[12.5px] font-medium text-tc-azure">
                      {s}
                      <span aria-hidden>×</span>
                      <span className="sr-only">Remove {s}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Skill match">
                {(['any', 'all'] as const).map(m => (
                  <button key={m} type="button" role="radio" aria-checked={(filters.skillMatch ?? 'any') === m} onClick={() => set({ skillMatch: m })} className={chip((filters.skillMatch ?? 'any') === m)}>
                    {m === 'any' ? 'Any of these' : 'All of these'}
                  </button>
                ))}
              </div>
            </>
          )}
          {!filters.skills?.length && facets?.skills.length ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {facets.skills.slice(0, 10).map(s => (
                <li key={s.name}>
                  <button type="button" onClick={() => addSkill(s.name)} className="rounded-full border border-tc-line px-2.5 py-1 text-[12.5px] text-tc-muted hover:border-tc-line-2 hover:text-tc-ink">
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Section>

        <Section title="Location">
          <label className="block text-[12.5px] font-medium text-tc-muted" htmlFor="tm-place">Within a distance of</label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="tm-place"
              className="gov-input"
              placeholder="City, ZIP or address"
              value={place}
              onChange={e => setPlace(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void applyRadius(); } }}
            />
          </div>
          <div role="radiogroup" aria-label="Distance" className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-tc-desk p-1">
            {[25, 50, 100].map(m => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={miles === m}
                onClick={() => { setMiles(m); if (filters.radius) set({ radius: { ...filters.radius, miles: m } }); }}
                className={`whitespace-nowrap rounded-full py-1.5 text-center text-[13px] font-medium transition-colors ${
                  miles === m ? 'bg-white text-tc-ink shadow-[0_1px_2px_rgba(12,27,51,0.15)]' : 'text-tc-muted hover:text-tc-ink'
                }`}
              >
                {m} mi
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void applyRadius()}
            disabled={placeBusy}
            className="mt-2 w-full rounded-md bg-tc-ink py-2 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {placeBusy ? 'Finding…' : filters.radius ? 'Update distance' : 'Apply distance'}
          </button>
          {placeErr && <p className="mt-2 text-[12.5px] text-tc-rose">{placeErr}</p>}
          {filters.radius && (
            <button type="button" onClick={() => { set({ radius: undefined }); setPlace(''); }} className="mt-2 text-[13px] font-medium text-tc-azure">
              Remove distance filter
            </button>
          )}
          <p className="mt-4 text-[12.5px] font-medium text-tc-muted">State</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {(facets?.states ?? []).slice(0, 24).map(s => (
              <li key={s.name}>
                <button type="button" onClick={() => set({ states: toggle(filters.states, s.name) })} className={chip(filters.states?.includes(s.name) ?? false)}>
                  {s.name} <span className="opacity-60">{s.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Experience">
          <p className="text-[12.5px] font-medium text-tc-muted">Seniority</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {SENIORITIES.map(s => (
              <li key={s}>
                <button type="button" onClick={() => set({ seniority: toggle(filters.seniority, s) })} className={chip(filters.seniority?.includes(s) ?? false)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] font-medium text-tc-muted">Years of experience</p>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="number" min={0} max={60} placeholder="Min" aria-label="Minimum years" className="gov-input" value={filters.yoeMin ?? ''} onChange={e => set({ yoeMin: e.target.value === '' ? undefined : Number(e.target.value) })} />
            <span className="text-tc-faint">to</span>
            <input type="number" min={0} max={60} placeholder="Max" aria-label="Maximum years" className="gov-input" value={filters.yoeMax ?? ''} onChange={e => set({ yoeMax: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </div>
        </Section>

        <Section title="Industry" defaultOpen={false}>
          <CheckList items={facets?.industries ?? []} selected={filters.industries} onToggle={n => set({ industries: toggle(filters.industries, n) })} />
        </Section>

        <Section title="Company" defaultOpen={false}>
          <input className="gov-input" placeholder="Search companies" value={companyText} onChange={e => setCompanyText(e.target.value)} />
          {companyMatches.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {companyMatches.map(c => (
                <li key={c.name}>
                  <button type="button" onClick={() => { set({ companies: toggle(filters.companies, c.name) }); setCompanyText(''); }} className="flex w-full items-center justify-between rounded-md px-1.5 py-1.5 text-left text-[13.5px] hover:bg-tc-desk">
                    <span className="truncate">{companyNames[c.name] ?? c.name}</span>
                    <span className="tabular-nums text-[12.5px] text-tc-faint">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {(filters.companies ?? []).length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {filters.companies!.map(k => (
                <li key={k}>
                  <button type="button" onClick={() => set({ companies: toggle(filters.companies, k) })} className="flex items-center gap-1 rounded-full bg-tc-azure/10 px-2.5 py-1 text-[12.5px] font-medium text-tc-azure">
                    {companyNames[k] ?? k} <span aria-hidden>×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Freshness and quality" defaultOpen={false}>
          <label htmlFor="tm-months" className="text-[12.5px] font-medium text-tc-muted">Resumes processed in the last</label>
          <select
            id="tm-months"
            className="gov-input mt-1.5"
            value={filters.months ?? ''}
            onChange={e => set({ months: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Any time</option>
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
          </select>
          <label htmlFor="tm-conf" className="mt-4 flex items-center justify-between text-[12.5px] font-medium text-tc-muted">
            Minimum parse confidence
            <span className="tabular-nums text-tc-ink">{Math.round((filters.minConfidence ?? 0) * 100)}%</span>
          </label>
          <input
            id="tm-conf"
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={filters.minConfidence ?? 0}
            onChange={e => set({ minConfidence: Number(e.target.value) || undefined })}
            className="mt-2 w-full accent-[#2A45D8]"
          />
        </Section>

        {mode === 'sales' && (
          <Section title="Client status">
            <ul className="space-y-0.5">
              {(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map(s => (
                <li key={s}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-[13.5px] hover:bg-tc-desk">
                    <input type="checkbox" checked={filters.clientStatus?.includes(s) ?? false} onChange={() => set({ clientStatus: toggle(filters.clientStatus, s) })} className="h-4 w-4 accent-[#2A45D8]" />
                    {CLIENT_STATUS_LABEL[s]}
                  </label>
                </li>
              ))}
            </ul>
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 px-1.5 text-[13.5px]">
              <input type="checkbox" checked={filters.prospectsOnly ?? false} onChange={e => set({ prospectsOnly: e.target.checked || undefined })} className="h-4 w-4 accent-[#2A45D8]" />
              On my prospect list only
            </label>
          </Section>
        )}
      </div>
    </div>
  );
}
