import { useEffect, useRef } from 'react';
import { useStateValue } from '../Context';
import { checkAuth } from '../api/auth';

// A transient failure (checkAuth's reason: 'unavailable' — network error,
// timeout, non-200, unparseable body) retries with backoff instead of
// immediately treating it as "logged out": a reload during a brief backend
// blip must not bounce a logged-in admin from /adminPlayers.
const RETRY_DELAYS_MS = [1000, 2000, 4000];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Decides isAuth from the real backend session (GET /auth/me) on app load,
// instead of trusting anything stored client-side.
export function useCheckAuth() {
  const [{ isAuth }, dispatch] = useStateValue();

  // Mirrors the latest isAuth so the pending check below can tell whether
  // the user already made their own decision (an explicit login or logout,
  // e.g. via the login modal) while it was still in flight; that decision
  // must never be overridden by a stale check result landing afterward.
  const isAuthRef = useRef(isAuth);
  useEffect(() => {
    isAuthRef.current = isAuth;
  }, [isAuth]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        const result = await checkAuth();
        if (cancelled) {
          return;
        }

        if (result.ok) {
          if (isAuthRef.current === null) {
            dispatch({ type: 'LOGIN' });
          }
          return;
        }

        if (result.reason === 'unavailable' && attempt < RETRY_DELAYS_MS.length) {
          await delay(RETRY_DELAYS_MS[attempt]);
          if (cancelled) {
            return;
          }
          continue;
        }

        if (isAuthRef.current === null) {
          dispatch({ type: 'UNLOGIN' });
        }
        return;
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
