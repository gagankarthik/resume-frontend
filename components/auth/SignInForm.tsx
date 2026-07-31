'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { IconAlert, IconArrowLeft, IconCheckCircle } from '@/components/ui/icons';

type Stage =
  | { kind: 'credentials' }
  | { kind: 'mfa'; challenge: 'SOFTWARE_TOKEN_MFA' | 'SMS_MFA'; session: string }
  | { kind: 'newPassword'; session: string }
  | { kind: 'forgotRequest' }
  | { kind: 'forgotConfirm' };

const FIELD =
  'h-11 w-full rounded-lg border border-tc-line-2 bg-white px-3.5 text-[15px] text-tc-ink ' +
  'placeholder:text-tc-faint transition-shadow outline-none ' +
  'focus:border-tc-azure focus:shadow-[0_0_0_3px_rgba(31,111,235,0.14)]';

const LABEL = 'mb-1.5 block text-[13px] font-medium text-tc-ink';

export default function SignInForm({ next = '/upload' }: { next?: string }) {
  const [stage, setStage] = useState<Stage>({ kind: 'credentials' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const post = async (url: string, payload: Record<string, unknown>) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, data: (await res.json()) as Record<string, unknown> };
  };

  const finish = () => {
    // A full navigation, so the server re-reads the new session cookie.
    window.location.href = next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      if (stage.kind === 'forgotRequest') {
        const { ok, data } = await post('/api/auth/forgot-password', { email });
        if (!ok) throw new Error(String(data.error));
        setStage({ kind: 'forgotConfirm' });
        setNotice('If that address has an account, a reset code is on its way.');
        return;
      }

      if (stage.kind === 'forgotConfirm') {
        const { ok, data } = await post('/api/auth/forgot-password', {
          email,
          code,
          newPassword,
        });
        if (!ok) throw new Error(String(data.error));
        setStage({ kind: 'credentials' });
        setCode('');
        setNewPassword('');
        setPassword('');
        setNotice('Password changed. Sign in with your new password.');
        return;
      }

      const payload: Record<string, unknown> =
        stage.kind === 'credentials'
          ? { email, password }
          : stage.kind === 'mfa'
            ? { email, challenge: stage.challenge, session: stage.session, code }
            : { email, challenge: 'NEW_PASSWORD_REQUIRED', session: stage.session, newPassword };

      const { ok, data } = await post('/api/auth/signin', payload);

      if (!ok) throw new Error(String(data.error ?? 'Sign-in failed.'));

      if (data.challenge === 'NEW_PASSWORD_REQUIRED') {
        setStage({ kind: 'newPassword', session: String(data.session) });
        setNotice('Choose a new password to finish setting up this account.');
        return;
      }

      if (data.challenge === 'SOFTWARE_TOKEN_MFA' || data.challenge === 'SMS_MFA') {
        setStage({
          kind: 'mfa',
          challenge: data.challenge as 'SOFTWARE_TOKEN_MFA' | 'SMS_MFA',
          session: String(data.session),
        });
        setNotice(
          data.challenge === 'SMS_MFA'
            ? 'We sent a code to your phone.'
            : 'Enter the code from your authenticator app.',
        );
        return;
      }

      if (data.ok) finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    setError(null);
    setNotice(null);
    setStage({ kind: 'credentials' });
  };

  const heading = {
    credentials: 'Sign in',
    mfa: 'Verify it is you',
    newPassword: 'Set a new password',
    forgotRequest: 'Reset your password',
    forgotConfirm: 'Enter your reset code',
  }[stage.kind];

  const sub = {
    credentials: 'Use the account your team set up for Truecopy.',
    mfa: 'One more step before we let you in.',
    newPassword: 'This account needs a password of your own.',
    forgotRequest: 'We will send a code to your email address.',
    forgotConfirm: 'Check your email, then choose a new password.',
  }[stage.kind];

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-tc-ink">{heading}</h1>
      <p className="mt-2 text-[14.5px] leading-[1.6] text-tc-muted">{sub}</p>

      <AnimatePresence mode="wait">
        {(error || notice) && (
          <motion.div
            key={error ?? notice}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role={error ? 'alert' : 'status'}
            className={`mt-6 flex gap-2.5 rounded-lg border p-3.5 text-[13.5px] leading-snug ${
              error
                ? 'border-tc-rose/30 bg-tc-rose/[0.05] text-tc-ink'
                : 'border-tc-mint/30 bg-tc-mint/[0.05] text-tc-ink'
            }`}
          >
            <span className={`mt-[1px] shrink-0 ${error ? 'text-tc-rose' : 'text-tc-mint'}`}>
              {error ? <IconAlert size={15} /> : <IconCheckCircle size={15} />}
            </span>
            {error ?? notice}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {(stage.kind === 'credentials' ||
          stage.kind === 'forgotRequest' ||
          stage.kind === 'forgotConfirm') && (
          <div>
            <label htmlFor="email" className={LABEL}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={FIELD}
              placeholder="you@company.com"
              readOnly={stage.kind === 'forgotConfirm'}
            />
          </div>
        )}

        {stage.kind === 'credentials' && (
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="password" className="text-[13px] font-medium text-tc-ink">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setStage({ kind: 'forgotRequest' });
                }}
                className="text-[12.5px] text-tc-azure transition-colors hover:text-tc-azure-d"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={FIELD}
              placeholder="••••••••••"
            />
          </div>
        )}

        {stage.kind === 'forgotConfirm' && (
          <div>
            <label htmlFor="code" className={LABEL}>
              Reset code
            </label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              className={`${FIELD} font-mono tracking-[0.2em]`}
              placeholder="123456"
            />
          </div>
        )}

        {stage.kind === 'mfa' && (
          <div>
            <label htmlFor="mfa" className={LABEL}>
              Verification code
            </label>
            <input
              id="mfa"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value)}
              className={`${FIELD} font-mono tracking-[0.2em]`}
              placeholder="123456"
            />
          </div>
        )}

        {(stage.kind === 'newPassword' || stage.kind === 'forgotConfirm') && (
          <div>
            <label htmlFor="newPassword" className={LABEL}>
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={FIELD}
              placeholder="At least 8 characters"
            />
            <p className="mt-2 text-[12.5px] text-tc-muted">
              Your pool may also require an uppercase letter, a number, or a symbol.
            </p>
          </div>
        )}

        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Working…
            </span>
          ) : stage.kind === 'credentials' ? (
            'Sign in'
          ) : stage.kind === 'forgotRequest' ? (
            'Send reset code'
          ) : (
            'Continue'
          )}
        </Button>

        {stage.kind !== 'credentials' && (
          <button
            type="button"
            onClick={back}
            className="flex w-full items-center justify-center gap-1.5 text-[13.5px] text-tc-muted transition-colors hover:text-tc-ink"
          >
            <IconArrowLeft size={14} />
            Back to sign in
          </button>
        )}
      </form>
    </div>
  );
}
