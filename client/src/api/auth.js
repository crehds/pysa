import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';

const SESSION_EXPIRED_MESSAGE = 'Tu sesión expiró, vuelve a loguearte';

// Logs in against the backend; never throws. The caller decides what to
// show the visitor based on `reason`, since that differs by context.
export async function login(username, password) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    return { ok: false, reason: 'network' };
  }

  if (response.status === 200) {
    return { ok: true };
  }
  if (response.status === 401) {
    return { ok: false, reason: 'invalid' };
  }
  if (response.status === 429) {
    return { ok: false, reason: 'rate-limited' };
  }
  if (response.status === 503) {
    return { ok: false, reason: 'not-configured' };
  }
  return { ok: false, reason: 'unknown' };
}

// Best-effort: the caller always clears local state afterward regardless of
// whether the request itself succeeded.
export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error(error);
  }
}

// Used on app load to decide isAuth from the real session instead of
// trusting anything stored client-side. GET /auth/me always answers 200
// when it can decide (backend/auth/network.js): "not logged in" is a
// normal outcome carried in body.authenticated, not an HTTP error to
// branch on. Only a genuinely unexpected response (a 5xx, or a network
// failure) falls back to { ok: false } here too, same as "not logged in".
export async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    const result = await response.json();
    if (result.body && result.body.authenticated) {
      return { ok: true, username: result.body.username };
    }
    return { ok: false };
  } catch (error) {
    return { ok: false };
  }
}

// Every admin write goes through this helper so the session cookie is
// always sent, and a session that expired mid-use is handled the same way
// everywhere: log the user out client-side and tell them so, instead of
// every call site reimplementing both. Returns the raw Response either way
// so callers keep using their existing `.json()`/Swal preConfirm chains.
export async function adminFetch(dispatch, url, options = {}) {
  const response = await fetch(url, { ...options, credentials: 'include' });
  if (response.status === 401) {
    dispatch({ type: 'UNLOGIN' });
    Swal.fire({
      icon: 'warning',
      text: SESSION_EXPIRED_MESSAGE,
    });
  }
  return response;
}
