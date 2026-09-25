'use client';

import { useMemo, useState } from 'react';
import { CLIENT_STATUS_LABEL, type CompanyRow, type Mode } from '@/lib/talent/types';
import { STATUS_COLOR } from './colors';

type Key = 'name' | 'industry' | 'count' | 'topFamily' | 'status';
type Sort = { key: Key; dir: 1 | -1 };

function SortTh({
  k,
  children,
  className = '',
  sort,
  setSort,
}: {
  k: Key;
  children: string;
  className?: string;
  sort: Sort;
  setSort: (fn: (s: Sort) => Sort) => void;
}) {
  return (
    <th
      scope="col"
      aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
      className={`sticky top-0 z-10 border-b border-tc-line bg-tc-desk px-4 py-3 text-left text-[12.5px] font-semibold text-tc-muted ${className}`}
    >
      <button
        type="button"
        onClick={() => setSort(s => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : k === 'count' ? -1 : 1 }))}
        className="inline-flex items-center gap-1 hover:text-tc-ink"
      >
        {children}
        {sort.key === k && <span aria-hidden>{sort.dir === 1 ? '↑' : '↓'}</span>}
      </button>
    </th>
  );
}

export default function TalentTable({
  rows,
  mode,
  onOpen,
}: {
  rows: CompanyRow[];
  mode: Mode;
  onOpen: (key: string) => void;
}) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: 'count', dir: -1 });

  const sorted = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return cmp * sort.dir;
    });
    return list;
  }, [rows, sort]);

  if (!rows.length) {
    return (
      <div className="grid h-full place-items-center p-10 text-center">
        <p className="max-w-sm text-[14.5px] text-tc-muted">
          No company has enough candidates in this view to show. Widen the filters, or add more resumes.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[860px] border-separate border-spacing-0 text-[14px]">
        <caption className="sr-only">Companies ranked by candidate count</caption>
        <thead>
          <tr>
            <th scope="col" className="sticky top-0 z-10 w-12 border-b border-tc-line bg-tc-desk px-4 py-3 text-left text-[12.5px] font-semibold text-tc-muted">#</th>
            <SortTh sort={sort} setSort={setSort} k="name">Company</SortTh>
            <SortTh sort={sort} setSort={setSort} k="industry">Industry</SortTh>
            <SortTh sort={sort} setSort={setSort} k="count" className="text-right">Candidates</SortTh>
            <SortTh sort={sort} setSort={setSort} k="topFamily">Top title family</SortTh>
            <th scope="col" className="sticky top-0 z-10 border-b border-tc-line bg-tc-desk px-4 py-3 text-left text-[12.5px] font-semibold text-tc-muted">Top skills</th>
            {mode === 'sales' ? (
              <>
                <SortTh sort={sort} setSort={setSort} k="status">Status</SortTh>
                <th scope="col" className="sticky top-0 z-10 border-b border-tc-line bg-tc-desk px-4 py-3 text-left text-[12.5px] font-semibold text-tc-muted">Contact</th>
              </>
            ) : (
              <th scope="col" className="sticky top-0 z-10 border-b border-tc-line bg-tc-desk px-4 py-3 text-left text-[12.5px] font-semibold text-tc-muted">Locations</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.key} className="group cursor-pointer hover:bg-tc-desk/60" onClick={() => onOpen(r.key)}>
              <td className="border-b border-tc-line px-4 py-3 tabular-nums text-tc-faint">{i + 1}</td>
              <td className="border-b border-tc-line px-4 py-3">
                <button type="button" onClick={e => { e.stopPropagation(); onOpen(r.key); }} className="text-left font-semibold text-tc-ink group-hover:text-tc-azure">
                  {r.name}
                </button>
                {r.prospect && <span className="ml-2 rounded bg-tc-azure/10 px-1.5 py-0.5 text-[11px] font-medium text-tc-azure">Prospect</span>}
              </td>
              <td className="border-b border-tc-line px-4 py-3 text-tc-muted">{r.industry}</td>
              <td className="border-b border-tc-line px-4 py-3 text-right font-semibold tabular-nums text-tc-ink">{r.count}</td>
              <td className="border-b border-tc-line px-4 py-3 text-tc-ink-2">{r.topFamily}</td>
              <td className="max-w-[240px] truncate border-b border-tc-line px-4 py-3 text-tc-muted">{r.topSkills.join(', ')}</td>
              {mode === 'sales' ? (
                <>
                  <td className="border-b border-tc-line px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-tc-ink">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[r.status] }} />
                      {CLIENT_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="border-b border-tc-line px-4 py-3 text-[13px]">
                    <span className="flex gap-3" onClick={e => e.stopPropagation()}>
                      {r.website && <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-tc-azure hover:underline">Site</a>}
                      {r.careers && <a href={r.careers} target="_blank" rel="noopener noreferrer" className="text-tc-azure hover:underline">Careers</a>}
                      {r.phone && <a href={`tel:${r.phone}`} className="text-tc-ink">{r.phone}</a>}
                      {!r.website && !r.careers && !r.phone && <span className="text-tc-faint">Not added</span>}
                    </span>
                  </td>
                </>
              ) : (
                <td className="max-w-[220px] truncate border-b border-tc-line px-4 py-3 text-tc-muted">{r.places.join('; ')}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
