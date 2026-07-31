'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Session =
  | { state: 'loading' }
  | { state: 'off' }
  | { state: 'out' }
  | { state: 'in'; email?: string; name?: string };

export default function UserMenu() {
  const [session, setSession] = useState<Session>({ state: 'loading' });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/session')
      .then(r => r.json())
      .then((d: { authenticated: boolean; configured: boolean; user?: { email?: string; name?: string } }) => {
        if (!alive) return;
        if (!d.configured) setSession({ state: 'off' });
        else if (!d.authenticated) setSession({ state: 'out' });
        else setSession({ state: 'in', email: d.user?.email, name: d.user?.name });
      })
      .catch(() => alive && setSession({ state: 'off' }));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (session.state === 'loading' || session.state === 'off') return null;

  if (session.state === 'out') {
    return (
      <a
        href="/signin"
        className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-tc-muted transition-colors hover:bg-tc-desk hover:text-tc-ink"
      >
        Sign in
      </a>
    );
  }

  const label = session.name ?? session.email ?? 'Account';
  const initial = label.trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account: ${session.email ?? label}`}
        title={session.email ?? label}
        className="grid h-8 w-8 place-items-center rounded-full bg-tc-ink text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-tc-line bg-white shadow-[0_12px_28px_-12px_rgba(11,27,51,0.28)]"
          >
            <div className="flex items-center gap-3 border-b border-tc-line px-4 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tc-ink text-[13px] font-semibold text-white">
                {initial}
              </span>
              <span className="min-w-0">
                {session.name && (
                  <span className="block truncate text-[13.5px] font-medium text-tc-ink">
                    {session.name}
                  </span>
                )}
                {session.email && (
                  <span className="block truncate text-[12.5px] text-tc-muted">
                    {session.email}
                  </span>
                )}
              </span>
            </div>
            <a
              href="/api/auth/logout"
              role="menuitem"
              className="block px-4 py-3 text-[13.5px] text-tc-ink transition-colors hover:bg-tc-desk"
            >
              Sign out
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
