import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { Provider } from '../../Context';
import { Logging } from './index';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => Promise.resolve({})) },
}));
vi.mock('../../api/auth', () => ({
  login: vi.fn(() => Promise.resolve({ ok: true })),
  logout: vi.fn(() => Promise.resolve()),
}));

function renderLogging({ isLogging = false } = {}) {
  return render(
    <Provider>
      <Logging isLogging={isLogging} handleLogging={() => {}} />
    </Provider>
  );
}

function setBrowserLanguages(languages) {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true });
}

// What every Swal.fire call showed, as one string (title, text, html, buttons).
function everythingShown() {
  return JSON.stringify(vi.mocked(Swal.fire).mock.calls);
}

beforeEach(() => {
  vi.mocked(Swal.fire).mockClear();
  vi.mocked(Swal.fire).mockImplementation(() => Promise.resolve({}));
});

test('the login dialog labels its fields, keeping the #user and #password hooks', async () => {
  const user = userEvent.setup();
  renderLogging();

  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

  const { html } = vi.mocked(Swal.fire).mock.calls[0][0];
  const dialog = document.createElement('div');
  dialog.innerHTML = html;
  document.body.append(dialog);

  // Visible labels tied to the inputs (not placeholders or bare inputs).
  const userField = screen.getByLabelText('Usuario');
  const passwordField = screen.getByLabelText('Contraseña');
  expect(userField).toHaveAttribute('id', 'user');
  expect(passwordField).toHaveAttribute('id', 'password');
  expect(passwordField).toHaveAttribute('type', 'password');
  expect(userField).toHaveAttribute('autocomplete', 'username');
  expect(passwordField).toHaveAttribute('autocomplete', 'current-password');
  dialog.remove();
});

describe.each([
  {
    language: 'es',
    languages: ['es-ES'],
    loginButton: 'Iniciar sesión',
    logoutButton: 'Cerrar sesión',
    loginTitle: 'Iniciar sesión',
    labels: ['Usuario', 'Contraseña'],
    welcome: 'Sesión iniciada.',
    logoutTitle: '¿Cerrar sesión?',
    confirm: 'Cerrar sesión',
    cancel: 'Quedarme',
    goodbye: 'Sesión cerrada.',
    errors: {
      invalid: 'Usuario o contraseña incorrectos.',
      unknown: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      'rate-limited': 'Demasiados intentos. Inténtalo de nuevo más tarde.',
      'not-configured': 'El inicio de sesión de administrador no está configurado.',
      network: 'Error de red. Inténtalo de nuevo.',
    },
  },
  {
    language: 'en',
    languages: ['en-US'],
    loginButton: 'Log in',
    logoutButton: 'Log out',
    loginTitle: 'Log in',
    labels: ['Username', 'Password'],
    welcome: 'You are logged in.',
    logoutTitle: 'Log out?',
    confirm: 'Log out',
    cancel: 'Stay',
    goodbye: 'You have been logged out.',
    errors: {
      invalid: 'Wrong username or password.',
      unknown: 'Could not log in. Try again.',
      'rate-limited': 'Too many attempts. Try again later.',
      'not-configured': 'Admin login is not configured.',
      network: 'Network error. Try again.',
    },
  },
])('the dialogs in $language', (copy) => {
  beforeEach(() => setBrowserLanguages(copy.languages));

  test('the login dialog has a plain title and labeled fields', async () => {
    const user = userEvent.setup();
    renderLogging();
    await user.click(screen.getByRole('button', { name: copy.loginButton }));

    const options = vi.mocked(Swal.fire).mock.calls[0][0];
    expect(options.title).toBe(copy.loginTitle);
    for (const label of copy.labels) {
      expect(options.html).toContain(`>${label}</label>`);
    }
  });

  test('a successful login says so', async () => {
    const user = userEvent.setup();
    vi.mocked(Swal.fire).mockResolvedValueOnce({ value: { ok: true } });
    renderLogging();
    await user.click(screen.getByRole('button', { name: copy.loginButton }));

    await vi.waitFor(() =>
      expect(Swal.fire).toHaveBeenLastCalledWith({ icon: 'success', text: copy.welcome })
    );
  });

  test.each(Object.entries(copy.errors))('a failed login (%s) says why', async (reason, text) => {
    const user = userEvent.setup();
    vi.mocked(Swal.fire).mockResolvedValueOnce({ value: { ok: false, reason } });
    renderLogging();
    await user.click(screen.getByRole('button', { name: copy.loginButton }));

    await vi.waitFor(() =>
      expect(Swal.fire).toHaveBeenLastCalledWith({ icon: 'error', text })
    );
  });

  test('the logout dialog asks plainly and says goodbye', async () => {
    const user = userEvent.setup();
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true });
    renderLogging({ isLogging: true });
    await user.click(screen.getByRole('button', { name: copy.logoutButton }));

    expect(Swal.fire).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: copy.logoutTitle,
        confirmButtonText: copy.confirm,
        cancelButtonText: copy.cancel,
        showCancelButton: true,
      })
    );
    await vi.waitFor(() =>
      expect(Swal.fire).toHaveBeenNthCalledWith(2, copy.goodbye, '', 'success')
    );
  });

  test('no dialog uses slang', async () => {
    const user = userEvent.setup();
    vi.mocked(Swal.fire).mockResolvedValueOnce({ value: { ok: true } });
    renderLogging();
    await user.click(screen.getByRole('button', { name: copy.loginButton }));
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true });
    const view = renderLogging({ isLogging: true });
    await user.click(view.getByRole('button', { name: copy.logoutButton }));

    expect(everythingShown()).not.toMatch(/papu|ñafo|logue|digno/i);
  });
});
