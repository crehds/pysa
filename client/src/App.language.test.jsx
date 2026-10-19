import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { Provider } from './Context';
import { BrowserRouter } from 'react-router';
import { STORAGE_KEY } from './i18n/detectLanguage';

const players = [
  {
    _id: 'player-1',
    nickname: 'PlayerOne',
    estado: true,
    medail: 'medail-1',
    mmr: 1500,
    imgURL: '/default/default-user.png',
  },
];
const scores = [
  {
    playerId: 'player-1',
    rolesScore: [
      {
        rol: 'role-1',
        victories: 5,
        victoriesDouble: 0,
        defeats: 2,
        defeatsDouble: 0,
        kills: 20,
        deaths: 10,
        assists: 15,
      },
    ],
  },
];

function jsonResponse(body) {
  return Promise.resolve({ status: 200, json: () => Promise.resolve({ error: '', body }) });
}

function mockApi() {
  global.fetch = vi.fn((url) => {
    if (url.includes('players/getAllPlayers')) return jsonResponse(players);
    if (url.includes('scores/getScoreOfPlayers')) return jsonResponse(scores);
    if (url.includes('medails/getMedails')) return jsonResponse([{ _id: 'medail-1', name: 'Cruzado' }]);
    if (url.includes('roles/getRoles')) return jsonResponse([{ _id: 'role-1', name: 'Hard Carry' }]);
    if (url.includes('auth/me')) return jsonResponse({ authenticated: false });
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
  });
}

function setBrowserLanguages(languages) {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true });
}

function renderAppAt(path) {
  window.history.pushState({}, '', path);
  return render(
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}

async function renderLoaded(path = '/') {
  const view = renderAppAt(path);
  await screen.findByText('PlayerOne');
  return view;
}

function switchGroup() {
  return screen.getByRole('group', { name: /^(Idioma|Language)$/ });
}

beforeEach(() => {
  mockApi();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the language switch', () => {
  test('is a labeled group of two buttons inside the one navigation', async () => {
    await renderLoaded();

    const navigation = screen.getByRole('navigation');
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    const group = within(navigation).getByRole('group', { name: 'Idioma' });
    expect(within(group).getByRole('button', { name: 'Español' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'English' })).toBeInTheDocument();
  });

  test('announces the current language with aria-pressed', async () => {
    setBrowserLanguages(['es-ES']);
    await renderLoaded();

    expect(screen.getByRole('button', { name: 'Español' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('starts in the language the browser asks for', async () => {
    setBrowserLanguages(['en-GB', 'es']);
    await renderLoaded();

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(switchGroup()).toHaveAccessibleName('Language');
    expect(document.documentElement.lang).toBe('en');
  });

  test('choosing English switches the language and relabels the group', async () => {
    const user = userEvent.setup();
    setBrowserLanguages(['es-ES']);
    await renderLoaded();
    expect(document.documentElement.lang).toBe('es');

    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Español' })).toHaveAttribute('aria-pressed', 'false');
    expect(switchGroup()).toHaveAccessibleName('Language');
    expect(document.documentElement.lang).toBe('en');
  });

  test('remembers the choice, and it wins over the browser on the next visit', async () => {
    const user = userEvent.setup();
    setBrowserLanguages(['es-ES']);
    const first = await renderLoaded();
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
    first.unmount();

    await renderLoaded();

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.lang).toBe('en');
  });

  test('still switches for the visit when the storage is blocked', async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    setBrowserLanguages(['es-ES']);
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.lang).toBe('en');
  });
});

describe('the document language and title', () => {
  test('<html lang> and the page title follow the language on every route', async () => {
    const user = userEvent.setup();
    setBrowserLanguages(['es-ES']);
    await renderLoaded('/players');
    expect(document.documentElement.lang).toBe('es');
    expect(document.title).toBe('Jugadores · Pysa');

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Players · Pysa');

    await user.click(screen.getByRole('link', { name: 'Ranking' }));
    expect(document.title).toBe('Ranking · Pysa');

    await user.click(screen.getByRole('button', { name: 'Español' }));
    expect(document.documentElement.lang).toBe('es');
    expect(document.title).toBe('Ranking · Pysa');
  });
});
