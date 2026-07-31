/**
 * Loading placeholders.
 *
 * These mirror the shape of what is coming — a page, a field, a row — so the
 * layout does not jump when the real thing arrives.
 */

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-md bg-tc-desk-2 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ widths = [96, 88, 72] }: { widths?: number[] }) {
  return (
    <span className="block space-y-2" aria-hidden="true">
      {widths.map((w, i) => (
        <span
          key={i}
          className="block h-[10px] animate-pulse rounded-md bg-tc-desk-2"
          style={{ width: `${w}%` }}
        />
      ))}
    </span>
  );
}

/** A page-shaped placeholder, used wherever a document preview will appear. */
export function SkeletonSheet({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-tc-line bg-white p-5 ${className}`}
      aria-hidden="true"
    >
      <div className="mx-auto mb-4 h-[9px] w-1/2 animate-pulse rounded-full bg-tc-desk-2" />
      <div className="mx-auto mb-6 h-[5px] w-1/3 animate-pulse rounded-full bg-tc-desk" />
      {[
        [96, 88, 92],
        [90, 76],
        [94, 84, 70],
      ].map((group, g) => (
        <div key={g} className="mb-5">
          <div className="mb-2.5 h-[6px] w-24 animate-pulse rounded-full bg-tc-desk-2" />
          <div className="space-y-[6px]">
            {group.map((w, i) => (
              <div
                key={i}
                className="h-[5px] animate-pulse rounded-full bg-tc-desk"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A stack of form rows, used while the editor loads its record. */
export function SkeletonFields({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div className="mb-2 h-[9px] w-20 animate-pulse rounded-full bg-tc-desk-2" />
          <div className="h-9 animate-pulse rounded-lg border border-tc-line bg-tc-desk/60" />
        </div>
      ))}
    </div>
  );
}

/** Announce loading to assistive tech without describing every placeholder. */
export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
