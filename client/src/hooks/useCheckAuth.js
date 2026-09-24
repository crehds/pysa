import { useEffect } from 'react';
import { useStateValue } from '../Context';
import { checkAuth } from '../api/auth';

// Decides isAuth from the real backend session (GET /auth/me) on app load,
// instead of trusting anything stored client-side.
export function useCheckAuth() {
  const [, dispatch] = useStateValue();

  useEffect(() => {
    let cancelled = false;

    checkAuth().then((result) => {
      if (cancelled) {
        return;
      }
      dispatch({ type: result.ok ? 'LOGIN' : 'UNLOGIN' });
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
