import { authConfigured } from '@/lib/auth/config';

/**
 * A deployment running without sign-in should say so.
 *
 * When the Cognito variables are missing the app falls open by design — the
 * gates pass, and the account menu has nothing to show, so the header simply
 * looks like a site that never asks you to sign in. That silence is the
 * problem: an open deployment can upload resumes and spend tokens. Say it
 * plainly, on the pages where it matters, until the variables are set.
 */
export default function OpenAccessNotice() {
  if (authConfigured()) return null;

  return (
    <div className="border-b border-tc-amber/30 bg-tc-amber/[0.07] px-5 py-2.5">
      <p className="mx-auto max-w-[1140px] text-[12.5px] leading-relaxed text-tc-ink">
        <span className="font-medium">No sign-in on this deployment.</span>{' '}
        Anyone with the link can upload resumes and run matches. Set{' '}
        <code className="font-mono text-[11.5px]">NEXT_COGNITO_DOMAIN</code>,{' '}
        <code className="font-mono text-[11.5px]">NEXT_COGNITO_USER_POOL_ID</code>, and{' '}
        <code className="font-mono text-[11.5px]">NEXT_COGNITO_CLIENT_ID</code> in the hosting
        console, then redeploy.
      </p>
    </div>
  );
}
