import Link from 'next/link';
import { HireLogo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';

const REASONS: Record<string, string> = {
  bad_state: 'The sign-in request did not match this browser. Start again.',
  missing_code: 'Sign-in did not complete. Start again.',
  token_exchange_failed: 'The identity provider rejected the sign-in. Try once more.',
  invalid_id_token: 'The sign-in could not be verified. Try once more.',
  no_id_token: 'The identity provider did not return an identity. Try once more.',
  denied: 'Sign-in was cancelled.',
};

export const metadata = { title: 'Signed out' };

export default async function SignedOut({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? (REASONS[error] ?? 'Sign-in did not complete.') : null;

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-tc-line">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center px-5">
          <HireLogo />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-md text-center">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-tc-ink">
            {message ? 'Sign-in did not finish' : 'You are signed out'}
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-tc-muted">
            {message ?? 'Your session on this device has ended. Nothing was left behind.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/signin?next=%2Fupload" size="lg">
              Sign in
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
    </main>
  );
}
