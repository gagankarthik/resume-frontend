'use client';

import { useEffect, useState } from 'react';

export type ClientSession =
  | { state: 'loading' }
  | { state: 'off' }
  | { state: 'out' }
  | { state: 'in'; email?: string; name?: string };

type SessionBody = { authenticated: boolean; configured: boolean; user?: { email?: string; name?: string } };

/* One request per page load, shared by every component that asks. */
let pending: Promise<ClientSession> | null = null;

function load(): Promise<ClientSession> {
  pending ??= fetch('/api/auth/session')
    .then(r => r.json() as Promise<SessionBody>)
    .then((d): ClientSession => {
      if (!d.configured) return { state: 'off' };
      if (!d.authenticated) return { state: 'out' };
      return { state: 'in', email: d.user?.email, name: d.user?.name };
    })
    .catch((): ClientSession => ({ state: 'off' }));
  return pending;
}

export function useSession(): ClientSession {
  const [session, setSession] = useState<ClientSession>({ state: 'loading' });
  useEffect(() => {
    let alive = true;
    load().then(s => alive && setSession(s));
    return () => { alive = false; };
  }, []);
  return session;
}
