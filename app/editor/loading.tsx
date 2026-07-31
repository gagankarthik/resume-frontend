import { TruecopyLogo } from '@/components/brand/Logo';
import { LoadingRegion, SkeletonFields, SkeletonSheet } from '@/components/ui/Skeleton';

export default function EditorLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-tc-desk">
      <header className="shrink-0 border-b border-tc-line bg-white">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-5">
          <TruecopyLogo size={28} />
          <span className="hidden h-5 w-px bg-tc-line sm:block" />
          <span className="h-[9px] w-40 animate-pulse rounded-full bg-tc-desk-2" />
          <span className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-tc-desk-2" />
        </div>
      </header>

      <LoadingRegion label="Loading the editor">
        <div className="grid flex-1 gap-px bg-tc-line lg:grid-cols-2">
          <div className="bg-white p-6">
            <div className="mb-6 h-[11px] w-28 animate-pulse rounded-full bg-tc-desk-2" />
            <SkeletonFields rows={6} />
          </div>
          <div className="bg-tc-desk p-6">
            <div className="mx-auto max-w-[520px]">
              <SkeletonSheet />
            </div>
          </div>
        </div>
      </LoadingRegion>
    </div>
  );
}
