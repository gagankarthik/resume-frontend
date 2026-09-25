'use client';

import { useEffect, useState } from 'react';
import { fetchCompany, saveCompany } from '@/lib/talent/client';
import {
  CLIENT_STATUS_LABEL,
  type ClientStatus,
  type CompanyDetail,
  type CompanyProfile,
  type Mode,
  type TalentFilters,
} from '@/lib/talent/types';
import { STATUS_COLOR } from './colors';

function Bars({ items, total }: { items: { name: string; count: number }[]; total: number }) {
  return (
    <ul className="space-y-2">
      {items.map(i => (
        <li key={i.name}>
          <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
            <span className="truncate text-tc-ink">{i.name}</span>
            <span className="tabular-nums text-tc-muted">{i.count}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-tc-desk-2">
            <div className="h-full rounded-full bg-tc-azure" style={{ width: `${Math.max(4, (i.count / Math.max(total, 1)) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Remove({ id, onRemoved }: { id: string; onRemoved: () => void }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className="text-[12.5px] text-tc-faint hover:text-tc-rose">
        Remove
      </button>
    );
  }
  return (
    <span className="flex items-center gap-2 text-[12.5px]">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await fetch(`/api/talent/records/${id}`, { method: 'DELETE' }).catch(() => {});
          onRemoved();
        }}
        className="font-semibold text-tc-rose"
      >
        {busy ? 'Removing…' : 'Remove from map'}
      </button>
      <button type="button" onClick={() => setArmed(false)} className="text-tc-muted">Keep</button>
    </span>
  );
}

export default function CompanyDrawer({
  companyKey,
  filters,
  mode,
  onClose,
  onChanged,
}: {
  companyKey: string;
  filters: TalentFilters;
  mode: Mode;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CompanyProfile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchCompany(companyKey, filters)
      .then(d => {
        if (!alive) return;
        setDetail(d);
        setForm({ status: d.profile.status, website: d.profile.website ?? '', careers: d.profile.careers ?? '', phone: d.profile.phone ?? '' });
        setError(null);
      })
      .catch(e => alive && setError(e instanceof Error ? e.message : 'The company could not be loaded.'));
    return () => { alive = false; };
  }, [companyKey, filters, reload]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async (patch: Partial<CompanyProfile>) => {
    setSaving(true);
    setSaved(false);
    try {
      const next = await saveCompany(companyKey, patch);
      setDetail(d => (d ? { ...d, profile: next } : d));
      setSaved(true);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The company could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const p = detail?.profile;
  const link = (href?: string, label?: string) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-tc-azure hover:underline">
        {label ?? href.replace(/^https?:\/\//, '')}
      </a>
    ) : (
      <span className="text-tc-faint">Not added</span>
    );

  return (
    <aside
      className="absolute inset-y-0 right-0 z-20 flex w-full max-w-[440px] flex-col border-l border-tc-line bg-white shadow-[-20px_0_40px_-24px_rgba(12,27,51,0.35)]"
      aria-label={p ? `${p.name} details` : 'Company details'}
    >
      <div className="flex items-start justify-between gap-4 border-b border-tc-line px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-[18px] font-bold tracking-[-0.015em] text-tc-ink">{p?.name ?? 'Loading…'}</h2>
          {detail && <p className="mt-0.5 text-[13.5px] text-tc-muted">{detail.industry}</p>}
          {detail && detail.spellings.length > 0 && (
            <p className="mt-1 text-[12.5px] text-tc-faint">Also written as {detail.spellings.join(', ')}</p>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-tc-muted hover:bg-tc-desk hover:text-tc-ink">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && <p className="m-5 rounded-md bg-tc-rose/[0.06] px-3 py-2.5 text-[13.5px] text-tc-rose">{error}</p>}
        {!detail && !error && <p className="p-5 text-[14px] text-tc-muted">Loading the company…</p>}

        {detail && p && (
          <>
            {/* Status and contact: both modes, per the requirement */}
            <section className="border-b border-tc-line px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="tm-status" className="text-[13px] font-medium text-tc-muted">Client status</label>
                <span className="flex items-center gap-1.5 text-[12.5px] text-tc-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[p.status] }} />
                  {CLIENT_STATUS_LABEL[p.status]}
                </span>
              </div>
              <select
                id="tm-status"
                className="gov-input mt-2"
                value={form.status ?? 'none'}
                onChange={e => {
                  const status = e.target.value as ClientStatus;
                  setForm(f => ({ ...f, status }));
                  void save({ status });
                }}
              >
                {(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map(s => (
                  <option key={s} value={s}>{CLIENT_STATUS_LABEL[s]}</option>
                ))}
              </select>

              <dl className="mt-4 space-y-2 text-[13.5px]">
                <div className="flex justify-between gap-4"><dt className="text-tc-muted">Website</dt><dd className="truncate">{link(p.website)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-tc-muted">Careers page</dt><dd className="truncate">{link(p.careers, p.careers ? 'Open roles' : undefined)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-tc-muted">Main phone</dt><dd>{p.phone ? <a href={`tel:${p.phone}`} className="font-medium text-tc-ink">{p.phone}</a> : <span className="text-tc-faint">Not added</span>}</dd></div>
              </dl>

              <details className="mt-3">
                <summary className="cursor-pointer text-[13px] font-medium text-tc-azure">Edit company details</summary>
                <div className="mt-3 space-y-2">
                  <input className="gov-input" placeholder="Website" value={form.website ?? ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                  <input className="gov-input" placeholder="Careers page" value={form.careers ?? ''} onChange={e => setForm(f => ({ ...f, careers: e.target.value }))} />
                  <input className="gov-input" placeholder="Main office phone" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  <p className="text-[12px] text-tc-faint">Public company numbers only. Never a person’s own number.</p>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void save({ website: form.website, careers: form.careers, phone: form.phone })}
                    className="rounded-md bg-tc-ink px-3.5 py-2 text-[13.5px] font-medium text-white disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save details'}
                  </button>
                  {saved && <span className="ml-3 text-[13px] text-tc-mint">Saved</span>}
                </div>
              </details>

              {mode === 'sales' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save({ prospect: !p.prospect })}
                  className={`mt-4 w-full rounded-md px-3.5 py-2.5 text-[14px] font-semibold transition-colors ${
                    p.prospect ? 'border border-tc-line-2 bg-white text-tc-ink hover:bg-tc-desk' : 'bg-tc-azure text-white hover:bg-tc-azure-d'
                  }`}
                >
                  {p.prospect ? 'Remove from prospect list' : 'Add to prospect list'}
                </button>
              )}
            </section>

            {detail.belowMinimum ? (
              <p className="px-5 py-6 text-[14px] leading-[1.6] text-tc-muted">
                Fewer than {detail.minCount} candidates at this company match the current filters, so the breakdown is
                hidden to protect their privacy.
              </p>
            ) : (
              <>
                <section className="border-b border-tc-line px-5 py-5">
                  <p className="text-[28px] font-bold leading-none tracking-[-0.03em] text-tc-ink tabular-nums">{detail.count}</p>
                  <p className="mt-1 text-[13.5px] text-tc-muted">candidates in this view</p>
                  <h3 className="mt-5 text-[13.5px] font-semibold text-tc-ink">By title family</h3>
                  <div className="mt-3"><Bars items={detail.families} total={detail.count} /></div>
                </section>

                <section className="border-b border-tc-line px-5 py-5">
                  <h3 className="text-[13.5px] font-semibold text-tc-ink">{mode === 'sales' ? 'Tech stack' : 'Top skills'}</h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {detail.skills.map(s => (
                      <li key={s.name} className="rounded-full bg-tc-desk px-2.5 py-1 text-[12.5px] text-tc-ink">
                        {s.name} <span className="text-tc-faint">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 grid grid-cols-2 gap-5">
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-tc-ink">Seniority</h3>
                      <ul className="mt-2 space-y-1 text-[13px] text-tc-muted">
                        {detail.seniority.map(s => <li key={s.name} className="flex justify-between"><span>{s.name}</span><span className="tabular-nums">{s.count}</span></li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-tc-ink">Sites</h3>
                      <ul className="mt-2 space-y-1 text-[13px] text-tc-muted">
                        {detail.places.map(s => <li key={s.name} className="flex justify-between gap-2"><span className="truncate">{s.name}</span><span className="tabular-nums">{s.count}</span></li>)}
                      </ul>
                    </div>
                  </div>
                </section>

                {mode === 'recruiting' && (
                  <section className="px-5 py-5">
                    <h3 className="text-[13.5px] font-semibold text-tc-ink">Candidates we hold</h3>
                    <p className="mt-1 text-[12.5px] text-tc-muted">Newest first. Open the original resume from your own files.</p>
                    <ul className="mt-3 divide-y divide-tc-line">
                      {detail.candidates.map(c => (
                        <li key={c.id} className="py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[14px] font-medium text-tc-ink">{c.title}</p>
                            <Remove id={c.id} onRemoved={() => { setReload(r => r + 1); onChanged(); }} />
                          </div>
                          <p className="mt-0.5 text-[12.5px] text-tc-muted">
                            {c.seniority}
                            {c.yoe != null ? `, ${c.yoe} yrs` : ''}
                            {c.place ? ` · ${c.place}` : ''} · {new Date(c.resumeDate).toLocaleDateString()}
                          </p>
                          {c.companyRaw && c.companyRaw !== p.name && (
                            <p className="mt-0.5 text-[12.5px] text-tc-muted">Employer on resume: {c.companyRaw}</p>
                          )}
                          {c.skills.length > 0 && <p className="mt-1 truncate text-[12.5px] text-tc-faint">{c.skills.join(', ')}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
