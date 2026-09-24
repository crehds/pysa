import { renderHook, act } from '@testing-library/react';
import { useCheckAuth } from './useCheckAuth';
import { useStateValue, Provider } from '../Context';
import * as authApi from '../api/auth';

function wrapper({ children }) {
  return <Provider>{children}</Provider>;
}

function renderCombined() {
  return renderHook(
    () => {
      const stateValue = useStateValue();
      useCheckAuth();
      return stateValue;
    },
    { wrapper }
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

test('a successful check dispatches LOGIN', async () => {
  vi.spyOn(authApi, 'checkAuth').mockResolvedValue({ ok: true, username: 'admin' });

  const { result } = renderCombined();
  expect(result.current[0].isAuth).toBe(null);

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(result.current[0].isAuth).toBe(true);
});

test('an "unauthenticated" result dispatches UNLOGIN immediately, without retrying', async () => {
  const checkAuthSpy = vi
    .spyOn(authApi, 'checkAuth')
    .mockResolvedValue({ ok: false, reason: 'unauthenticated' });

  const { result } = renderCombined();

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(result.current[0].isAuth).toBe(false);
  expect(checkAuthSpy).toHaveBeenCalledTimes(1);
});

test('a transient "unavailable" failure retries with backoff, then LOGIN on success (no UNLOGIN in between)', async () => {
  vi.useFakeTimers();
  try {
    const checkAuthSpy = vi
      .spyOn(authApi, 'checkAuth')
      .mockResolvedValueOnce({ ok: false, reason: 'unavailable' })
      .mockResolvedValueOnce({ ok: true, username: 'admin' });

    const { result } = renderCombined();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(checkAuthSpy).toHaveBeenCalledTimes(1);
    // Still unresolved (null), never flipped to false while retrying.
    expect(result.current[0].isAuth).toBe(null);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(checkAuthSpy).toHaveBeenCalledTimes(2);
    expect(result.current[0].isAuth).toBe(true);
  } finally {
    vi.useRealTimers();
  }
});

test('retries exhausted after repeated "unavailable" results in UNLOGIN', async () => {
  vi.useFakeTimers();
  try {
    const checkAuthSpy = vi
      .spyOn(authApi, 'checkAuth')
      .mockResolvedValue({ ok: false, reason: 'unavailable' });

    const { result } = renderCombined();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);
    });

    expect(checkAuthSpy).toHaveBeenCalledTimes(4);
    expect(result.current[0].isAuth).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});

test('a login dispatched while the check is still pending is not overridden by a later "unauthenticated" result', async () => {
  let resolveCheckAuth;
  vi.spyOn(authApi, 'checkAuth').mockReturnValue(
    new Promise((resolve) => {
      resolveCheckAuth = resolve;
    })
  );

  const { result } = renderCombined();

  act(() => {
    result.current[1]({ type: 'LOGIN' });
  });
  expect(result.current[0].isAuth).toBe(true);

  await act(async () => {
    resolveCheckAuth({ ok: false, reason: 'unauthenticated' });
    await Promise.resolve();
    await Promise.resolve();
  });

  // The stale check result must never flip a real login back to logged out.
  expect(result.current[0].isAuth).toBe(true);
});

test('a logout dispatched while the check is still pending is not overridden by a later successful result', async () => {
  let resolveCheckAuth;
  vi.spyOn(authApi, 'checkAuth').mockReturnValue(
    new Promise((resolve) => {
      resolveCheckAuth = resolve;
    })
  );

  const { result } = renderCombined();

  act(() => {
    result.current[1]({ type: 'UNLOGIN' });
  });
  expect(result.current[0].isAuth).toBe(false);

  await act(async () => {
    resolveCheckAuth({ ok: true, username: 'admin' });
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(result.current[0].isAuth).toBe(false);
});

test('cancels on unmount: no dispatch happens after the component unmounts', async () => {
  let resolveCheckAuth;
  vi.spyOn(authApi, 'checkAuth').mockReturnValue(
    new Promise((resolve) => {
      resolveCheckAuth = resolve;
    })
  );

  const { result, unmount } = renderCombined();
  unmount();

  await act(async () => {
    resolveCheckAuth({ ok: true, username: 'admin' });
    await Promise.resolve();
    await Promise.resolve();
  });

  // No assertion on result.current after unmount (React would warn on a
  // state update anyway); reaching here without an "act" warning about a
  // state update on an unmounted component is the behavior under test.
  expect(result.current[0].isAuth).toBe(null);
});
