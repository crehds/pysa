import Swal from 'sweetalert2';
import { login, logout, checkAuth, adminFetch, readAdminJson } from './auth';
import { API_BASE_URL } from '../config';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

function jsonResponse(status, body) {
  return Promise.resolve({
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  Swal.fire.mockClear();
});

describe('login', () => {
  test('POSTs to /auth/login with credentials: include and the typed body', async () => {
    global.fetch = vi.fn(() => jsonResponse(200, { error: '', body: { username: 'admin' } }));
    const result = await login('admin', 'secret');

    expect(result).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'secret' }),
      })
    );
  });

  test('a 401 maps to reason "invalid"', async () => {
    global.fetch = vi.fn(() =>
      jsonResponse(401, { error: 'Invalid username or password', body: '' })
    );
    expect(await login('admin', 'wrong')).toEqual({ ok: false, reason: 'invalid' });
  });

  test('a 429 maps to reason "rate-limited"', async () => {
    global.fetch = vi.fn(() =>
      jsonResponse(429, { error: 'Too many login attempts, try again later', body: '' })
    );
    expect(await login('admin', 'secret')).toEqual({ ok: false, reason: 'rate-limited' });
  });

  test('a 503 maps to reason "not-configured"', async () => {
    global.fetch = vi.fn(() =>
      jsonResponse(503, { error: 'Admin login is not configured', body: '' })
    );
    expect(await login('admin', 'secret')).toEqual({ ok: false, reason: 'not-configured' });
  });

  test('a network failure maps to reason "network" instead of throwing', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network down')));
    expect(await login('admin', 'secret')).toEqual({ ok: false, reason: 'network' });
  });
});

describe('logout', () => {
  test('POSTs to /auth/logout with credentials: include', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ status: 200 }));
    await logout();
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/logout`,
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
  });

  test('never throws, even on a network failure', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network down')));
    await expect(logout()).resolves.toBeUndefined();
  });
});

describe('checkAuth', () => {
  // GET /auth/me always answers 200 when it can decide (backend/auth/network.js):
  // authenticated is the signal, not the HTTP status. "Not logged in" is a
  // normal outcome (reason: 'unauthenticated'), distinct from a genuinely
  // unexpected failure (reason: 'unavailable'), so useCheckAuth
  // (client/src/hooks/useCheckAuth.js) can retry the latter instead of
  // logging a reloading admin out on a transient blip.
  test('GETs /auth/me with credentials: include and a timeout, and returns the username when authenticated', async () => {
    global.fetch = vi.fn(() =>
      jsonResponse(200, { error: '', body: { authenticated: true, username: 'admin' } })
    );
    const result = await checkAuth();

    expect(result).toEqual({ ok: true, username: 'admin' });
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/me`,
      expect.objectContaining({ credentials: 'include', signal: expect.any(AbortSignal) })
    );
  });

  test('authenticated: false (still a 200) resolves to reason "unauthenticated", not a throw', async () => {
    global.fetch = vi.fn(() => jsonResponse(200, { error: '', body: { authenticated: false } }));
    expect(await checkAuth()).toEqual({ ok: false, reason: 'unauthenticated' });
  });

  test('an unexpected non-2xx response resolves to reason "unavailable", not a throw', async () => {
    global.fetch = vi.fn(() => jsonResponse(500, { error: 'Unexpected error', body: '' }));
    expect(await checkAuth()).toEqual({ ok: false, reason: 'unavailable' });
  });

  test('a network failure resolves to reason "unavailable"', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network down')));
    expect(await checkAuth()).toEqual({ ok: false, reason: 'unavailable' });
  });

  test('an unparseable body resolves to reason "unavailable"', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ status: 200, json: () => Promise.reject(new Error('bad json')) })
    );
    expect(await checkAuth()).toEqual({ ok: false, reason: 'unavailable' });
  });

  // AbortSignal.timeout's own internal timer isn't observable/fakeable from
  // here, so this exercises the shape it produces (fetch rejecting with a
  // TimeoutError DOMException) rather than waiting out a real 8s timeout.
  test('a timed-out request (AbortSignal.timeout rejecting with TimeoutError) resolves to reason "unavailable"', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new DOMException('The operation timed out.', 'TimeoutError'))
    );
    expect(await checkAuth()).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('adminFetch', () => {
  test('always adds credentials: include on top of the caller-supplied options', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ status: 200 }));
    const dispatch = vi.fn();

    await adminFetch(dispatch, 'https://api.example.com/players/newPlayers', {
      method: 'POST',
      body: 'x',
    });

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/players/newPlayers', {
      method: 'POST',
      body: 'x',
      credentials: 'include',
    });
  });

  test('works with no options at all', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ status: 200 }));
    await adminFetch(vi.fn(), 'https://api.example.com/x');
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/x', {
      credentials: 'include',
    });
  });

  test('on a 401, logs the user out client-side and shows a message', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ status: 401 }));
    const dispatch = vi.fn();

    await adminFetch(dispatch, 'https://api.example.com/players/newPlayers');

    expect(dispatch).toHaveBeenCalledWith({ type: 'UNLOGIN' });
    expect(Swal.fire).toHaveBeenCalledTimes(1);
  });

  test('does not touch client state on a non-401 response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ status: 200 }));
    const dispatch = vi.fn();

    await adminFetch(dispatch, 'https://api.example.com/players/newPlayers');

    expect(dispatch).not.toHaveBeenCalled();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  test('resolves with the raw Response either way', async () => {
    const response = { status: 200 };
    global.fetch = vi.fn(() => Promise.resolve(response));

    const result = await adminFetch(vi.fn(), 'https://api.example.com/x');

    expect(result).toBe(response);
  });
});

describe('readAdminJson', () => {
  // adminFetch already logged the user out and told them so on a 401
  // (tested above); callers just need to know not to treat that response's
  // (empty) body as a successful write.
  test('on a 401, resolves to false instead of parsing the body', async () => {
    const response = { status: 401, json: vi.fn() };
    expect(await readAdminJson(response)).toBe(false);
    expect(response.json).not.toHaveBeenCalled();
  });

  test('on any other status, resolves with the parsed JSON body', async () => {
    const body = { error: '', body: { id: 1 } };
    const response = { status: 200, json: () => Promise.resolve(body) };
    expect(await readAdminJson(response)).toEqual(body);
  });
});
