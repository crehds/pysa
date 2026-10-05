import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { Provider } from './Context';
import { BrowserRouter } from 'react-router';
import { pageTitle } from './utils/pageTitle';

const EMPTY_TEXT = 'Todavía no hay jugadores en el ranking.';
const ERROR_TEXT = 'No pudimos cargar el ranking.';

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

// `failures` is how many times the players request fails before it works.
function mockApi({ playerList = players, failures = 0 } = {}) {
  let remaining = failures;
  global.fetch = vi.fn((url) => {
    if (url.includes('players/getAllPlayers')) {
      if (remaining > 0) {
        remaining -= 1;
        return Promise.reject(new TypeError('Failed to fetch'));
      }
      return jsonResponse(playerList);
    }
    if (url.includes('scores/getScoreOfPlayers')) return jsonResponse(scores);
    if (url.includes('medails/getMedails')) return jsonResponse([{ _id: 'medail-1', name: 'Cruzado' }]);
    if (url.includes('roles/getRoles')) return jsonResponse([{ _id: 'role-1', name: 'Hard Carry' }]);
    if (url.includes('auth/me')) return jsonResponse({ authenticated: false });
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
  });
}

function playersFetches() {
  return global.fetch.mock.calls.filter(([url]) => url.includes('players/getAllPlayers')).length;
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

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('when the data cannot be loaded', () => {
  test('shows the error message and a retry button, never the empty state', async () => {
    mockApi({ failures: 1 });
    renderAppAt('/');

    expect(await screen.findByText(ERROR_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('announces the error to assistive technology', async () => {
    mockApi({ failures: 1 });
    renderAppAt('/');

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_TEXT);
  });

  test('"Reintentar" fetches again and shows the ranking when it works', async () => {
    const user = userEvent.setup();
    mockApi({ failures: 1 });
    renderAppAt('/');
    await user.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('PlayerOne')).toBeInTheDocument();
    expect(playersFetches()).toBe(2);
    expect(screen.queryByText(ERROR_TEXT)).not.toBeInTheDocument();
  });

  test('"Reintentar" shows the error again when it still fails', async () => {
    const user = userEvent.setup();
    mockApi({ failures: 2 });
    renderAppAt('/');
    await user.click(await screen.findByRole('button', { name: 'Reintentar' }));

    await waitFor(() => expect(playersFetches()).toBe(2));
    expect(await screen.findByText(ERROR_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  test('a response without data counts as a failure too', async () => {
    global.fetch = vi.fn((url) =>
      url.includes('auth/me')
        ? jsonResponse({ authenticated: false })
        : Promise.resolve({ status: 500, json: () => Promise.resolve({ error: 'boom' }) })
    );
    renderAppAt('/');

    expect(await screen.findByText(ERROR_TEXT)).toBeInTheDocument();
  });
});

describe('refreshing from the loaded state', () => {
  test('one "Actualizar" click makes exactly one players request', async () => {
    const user = userEvent.setup();
    mockApi();
    renderAppAt('/');
    await screen.findByText('PlayerOne');
    expect(playersFetches()).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    await screen.findByText('PlayerOne');
    await waitFor(() => expect(playersFetches()).toBe(2));
    // Let any stray second request show up before asserting there is none.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(playersFetches()).toBe(2);
  });

  test('a failed refetch swaps the page for the error screen with "Reintentar"', async () => {
    const user = userEvent.setup();
    mockApi();
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    // The next players request fails.
    const working = global.fetch.getMockImplementation();
    global.fetch = vi.fn((url) =>
      url.includes('players/getAllPlayers')
        ? Promise.reject(new TypeError('Failed to fetch'))
        : working(url)
    );
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(await screen.findByText(ERROR_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('/players with no players', () => {
  test('shows the empty state once the data has loaded', async () => {
    mockApi({ playerList: [] });
    renderAppAt('/players');

    expect(await screen.findByRole('heading', { level: 1, name: 'Jugadores' })).toBeInTheDocument();
    // The splash is gone, so the four requests settled.
    expect(playersFetches()).toBe(1);
    expect(screen.getByText(EMPTY_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});

describe('the document title', () => {
  test('follows the route', async () => {
    const user = userEvent.setup();
    mockApi();
    renderAppAt('/');
    await screen.findByText('PlayerOne');
    expect(document.title).toBe('Ranking · Pysa');

    await user.click(screen.getByRole('link', { name: 'Jugadores' }));
    await screen.findByRole('heading', { level: 1, name: 'Jugadores' });
    expect(document.title).toBe('Jugadores · Pysa');

    await user.click(screen.getByRole('link', { name: 'Ranking' }));
    await screen.findByRole('heading', { level: 1, name: 'Ranking' });
    expect(document.title).toBe('Ranking · Pysa');
  });

  test('pageTitle names each route and falls back to the brand', () => {
    expect(pageTitle('/', 'es')).toBe('Ranking · Pysa');
    expect(pageTitle('/players', 'es')).toBe('Jugadores · Pysa');
    expect(pageTitle('/players/', 'es')).toBe('Jugadores · Pysa');
    expect(pageTitle('/adminPlayers', 'es')).toBe('Admin · Pysa');
    expect(pageTitle('/nowhere', 'es')).toBe('Pysa');
  });

  test('pageTitle names each route in English too', () => {
    expect(pageTitle('/', 'en')).toBe('Ranking · Pysa');
    expect(pageTitle('/players', 'en')).toBe('Players · Pysa');
    expect(pageTitle('/players/', 'en')).toBe('Players · Pysa');
    expect(pageTitle('/adminPlayers', 'en')).toBe('Admin · Pysa');
    expect(pageTitle('/nowhere', 'en')).toBe('Pysa');
  });
});

describe('a trailing slash', () => {
  test('/players/ shows exactly one "Actualizar"', async () => {
    mockApi();
    renderAppAt('/players/');

    await screen.findByRole('heading', { level: 1, name: 'Jugadores' });
    expect(screen.getAllByRole('button', { name: 'Actualizar' })).toHaveLength(1);
  });
});
