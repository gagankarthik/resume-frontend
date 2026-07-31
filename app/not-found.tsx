import Link from 'next/link';
import { TruecopyLogo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { IconArrowRight } from '@/components/ui/icons';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-tc-line">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center px-5">
          <TruecopyLogo />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-lg">
          {/* A page with nothing set on it */}
          <div className="mx-auto mb-10 w-[150px] rounded-lg border border-tc-line bg-white p-4 shadow-[0_10px_30px_-18px_rgba(11,27,51,0.4)]">
            <div className="mx-auto mb-3 h-[7px] w-1/2 rounded-full bg-tc-line-2" />
            <div className="space-y-[5px]">
              {[92, 78, 86].map((w, i) => (
                <div key={i} className="h-[4px] rounded-full bg-tc-line" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="mt-4 border-t border-dashed border-tc-line-2 pt-3 text-center font-mono text-[10px] text-tc-faint">
              404
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-tc-ink">
              That page is not here
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.6] text-tc-muted">
              The link may be out of date, or the address may have a typo in it.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/upload" size="lg">
                Upload a resume
                <IconArrowRight size={15} />
              </ButtonLink>
              <Link
                href="/"
                className="inline-flex h-12 items-center rounded-[10px] border border-tc-line-2 px-6 text-[15px] font-medium text-tc-ink transition-colors hover:bg-tc-desk"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
