import { HireLogo } from '@/components/brand/Logo';
import { LoadingRegion } from '@/components/ui/Skeleton';

export default function UploadLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="shrink-0 border-b border-tc-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center gap-4 px-5">
          <HireLogo size={28} />
          <span className="hidden h-5 w-px bg-tc-line sm:block" />
          <span className="h-[9px] w-48 animate-pulse rounded-full bg-tc-desk-2" />
        </div>
      </header>

      <LoadingRegion label="Loading the upload page">
        <main className="mx-auto grid w-full max-w-[1140px] gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-14">
          <div>
            <div className="h-[26px] w-64 animate-pulse rounded-md bg-tc-desk-2" />
            <div className="mt-3 h-[13px] w-80 animate-pulse rounded-full bg-tc-desk" />
            <div className="mt-8 rounded-xl border border-tc-line p-6">
              <div className="h-[236px] animate-pulse rounded-xl border border-dashed border-tc-line-2 bg-tc-desk/50" />
            </div>
          </div>
          <aside className="space-y-4">
            {[3, 3].map((rows, i) => (
              <div key={i} className="rounded-xl border border-tc-line p-5">
                <div className="h-[10px] w-28 animate-pulse rounded-full bg-tc-desk-2" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: rows }).map((_, j) => (
                    <div key={j} className="h-[11px] animate-pulse rounded-full bg-tc-desk" />
                  ))}
                </div>
              </div>
            ))}
          </aside>
        </main>
      </LoadingRegion>
    </div>
  );
}
