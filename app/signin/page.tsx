import { redirect } from 'next/navigation';
import Link from 'next/link';
import { HireLogo, HireMark } from '@/components/brand/Logo';
import SignInForm from '@/components/auth/SignInForm';
import { getSessionUser } from '@/lib/auth/guard';
import { authConfigured } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

function safePath(value: string | undefined): string {
  if (!value) return '/upload';
  return value.startsWith('/') && !value.startsWith('//') ? value : '/upload';
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safePath(next);

  // Already signed in — no reason to show the form.
  const user = await getSessionUser();
  if (user) redirect(target);

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Form */}
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex h-10 items-center justify-between">
          <HireLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium text-tc-muted transition-colors hover:bg-tc-desk hover:text-tc-ink"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M16.5 10h-13m4.5 4.5L3.5 10 8 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-14">
          {authConfigured() ? (
            <SignInForm next={target} />
          ) : (
            <div className="w-full max-w-[400px]">
              <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-tc-ink">
                Sign-in is not configured
              </h1>
              <p className="mt-3 text-[14.5px] leading-[1.6] text-tc-muted">
                This deployment has no user pool set, so Hire is running open. Set the
                Cognito values in the environment to require sign-in.
              </p>
              <Link
                href="/upload"
                className="mt-7 inline-flex h-11 items-center rounded-lg bg-tc-ink px-5 text-[14px] font-medium text-white"
              >
                Continue to upload
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-[12.5px] text-tc-faint">
          <Link href="/legal/privacy" className="transition-colors hover:text-tc-ink">
            Privacy
          </Link>
          <span className="px-2">·</span>
          <Link href="/legal/terms" className="transition-colors hover:text-tc-ink">
            Terms
          </Link>
          <span className="px-2">·</span>
          <Link href="/" className="transition-colors hover:text-tc-ink">
            Back to home
          </Link>
        </p>
      </div>

      {/* Panel — what you are signing in to */}
      <aside className="relative hidden overflow-hidden bg-tc-desk lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="max-w-[420px]">
          <HireMark size={40} />
          <p className="mt-7 text-[26px] font-semibold leading-[1.25] tracking-[-0.025em] text-tc-ink">
            Every resume, copied word for word and set to the format the state requires.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              'Twenty-plus sections read out of any PDF, Word, or text file',
              'Checked line by line against the original before you see it',
              'Four agency templates from one extracted record',
            ].map(item => (
              <li key={item} className="flex gap-3 text-[14.5px] leading-snug text-tc-muted">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                  className="mt-[3px] shrink-0 text-tc-mint"
                >
                  <path
                    d="m4.5 10.5 3.5 3.5 7.5-8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-12 border-t border-tc-line pt-6 text-[12.5px] text-tc-faint">
            Files are held in memory for the request and never written to disk on our
            servers.
          </p>
        </div>
      </aside>
    </main>
  );
}
