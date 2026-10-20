import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import App from './App';
import { Provider } from './Context';
import { INTRO_STORAGE_KEY } from './components/initLoading/introMarker';

// The first load in a tab plays the staged intro; every later load, and the
// reduced-motion level, shows the fast loader. setupTests marks the tab as
// played, so each test here clears the marker to start from a fresh tab.
const PLAYER = {
  _id: 'player-1',
  nickname: 'PlayerOne',
  estado: true,
  medail: 'medail-1',
  mmr: 2000,
  imgURL: '/default/default-user.png',
};

const SCORES = [
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

// `gate` holds the players request until it is released; `fail` rejects it.
function mockApi({ gate = null, fail = false } = {}) {
  global.fetch = vi.fn((url) => {
    if (url.includes('players/getAllPlayers')) {
      if (fail) return Promise.reject(new TypeError('Failed to fetch'));
      return gate ? gate.then(() => jsonResponse([PLAYER])) : jsonResponse([PLAYER]);
    }
    if (url.includes('scores/getScoreOfPlayers')) return jsonResponse(SCORES);
    if (url.includes('medails/getMedails')) return jsonResponse([{ _id: 'medail-1', name: 'Cruzado' }]);
    if (url.includes('roles/getRoles')) return jsonResponse([{ _id: 'role-1', name: 'Hard Carry' }]);
    if (url.includes('auth/me')) return jsonResponse({ authenticated: false });
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
  });
}

function makeGate() {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  return { gate, release };
}

function renderApp() {
  window.history.pushState({}, '', '/');
  return render(
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}

const advance = (ms) => act(async () => vi.advanceTimersByTimeAsync(ms));
// The curtain's timer starts once the minimum has passed, so play the two
// phases one after the other (full level: 2 s, then 0.5 s).
async function playFullIntro() {
  await advance(2000);
  await advance(500);
}
const status = () => screen.queryByRole('status', { name: 'Cargando' });
const skipButton = () => screen.queryByRole('button', { name: 'Saltar intro' });
const page = () => screen.queryByText('PlayerOne');

describe('the staged intro in the app', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    window.sessionStorage.removeItem(INTRO_STORAGE_KEY);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('full: early data wait for the minimum, the curtain opens on the page, then it is gone', async () => {
    mockApi();
    renderApp();
    expect(status()).toBeInTheDocument();
    expect(skipButton()).toBeInTheDocument();

    await advance(1500);
    // The data are in but the page stays behind the intro until its minimum.
    expect(page()).not.toBeInTheDocument();
    expect(skipButton()).toBeInTheDocument();

    await advance(500);
    // Curtain: the page is revealed under the intro.
    expect(page()).toBeInTheDocument();
    expect(status()).toBeInTheDocument();
    expect(skipButton()).not.toBeInTheDocument();

    await advance(500);
    expect(status()).not.toBeInTheDocument();
    expect(page()).toBeInTheDocument();
  });

  test('lite: about 1.2 s in all', async () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
    mockApi();
    renderApp();

    await advance(700);
    expect(page()).not.toBeInTheDocument();
    await advance(100);
    expect(page()).toBeInTheDocument();
    await advance(400);
    expect(status()).not.toBeInTheDocument();
  });

  test('late data keep the intro until they land', async () => {
    const { gate, release } = makeGate();
    mockApi({ gate });
    renderApp();

    await advance(6000);
    expect(status()).toBeInTheDocument();
    expect(skipButton()).toBeInTheDocument();
    expect(page()).not.toBeInTheDocument();

    release();
    await advance(10);
    expect(page()).toBeInTheDocument();
    await advance(500);
    expect(status()).not.toBeInTheDocument();
  });

  test('a failed load ends the intro and shows the error, with no curtain', async () => {
    mockApi({ fail: true });
    renderApp();

    await advance(50);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar el ranking.');
    expect(status()).not.toBeInTheDocument();
  });

  test('the next load in the same tab shows the fast loader', async () => {
    mockApi();
    const first = renderApp();
    await playFullIntro();
    first.unmount();

    const { gate, release } = makeGate();
    mockApi({ gate });
    renderApp();
    expect(status()).toBeInTheDocument();
    expect(skipButton()).not.toBeInTheDocument();
    release();
    await advance(10);
    expect(page()).toBeInTheDocument();
    expect(status()).not.toBeInTheDocument();
  });

  test('blocked storage still plays the intro', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    mockApi();
    renderApp();
    expect(skipButton()).toBeInTheDocument();
    await playFullIntro();
    expect(page()).toBeInTheDocument();
    expect(status()).not.toBeInTheDocument();
  });

  test('refreshing after the intro shows the fast loader', async () => {
    mockApi();
    renderApp();
    await playFullIntro();
    expect(status()).not.toBeInTheDocument();

    const { gate, release } = makeGate();
    mockApi({ gate });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await advance(10);
    expect(status()).toBeInTheDocument();
    expect(skipButton()).not.toBeInTheDocument();
    release();
    await advance(10);
    expect(status()).not.toBeInTheDocument();
    expect(page()).toBeInTheDocument();
  });

  describe('skipping', () => {
    const skips = [
      ['the skip button', () => fireEvent.click(skipButton())],
      ['a click anywhere', () => fireEvent.click(status())],
      ['Esc', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ];

    test.each(skips)('%s shows the page at once when the data are ready', async (_name, skip) => {
      mockApi();
      renderApp();
      await advance(100);
      expect(page()).not.toBeInTheDocument();

      act(skip);
      expect(page()).toBeInTheDocument();
      expect(status()).not.toBeInTheDocument();
    });

    test.each(skips)('%s falls back to the fast loader when the data are not ready', async (_name, skip) => {
      const { gate, release } = makeGate();
      mockApi({ gate });
      renderApp();
      await advance(100);

      act(skip);
      expect(status()).toBeInTheDocument();
      expect(skipButton()).not.toBeInTheDocument();
      expect(page()).not.toBeInTheDocument();

      release();
      await advance(10);
      expect(page()).toBeInTheDocument();
      expect(status()).not.toBeInTheDocument();
    });
  });

  test('none: no intro and no wait, just the static fast loader', async () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    const { gate, release } = makeGate();
    mockApi({ gate });
    renderApp();
    expect(status()).toBeInTheDocument();
    expect(skipButton()).not.toBeInTheDocument();

    release();
    await advance(10);
    expect(page()).toBeInTheDocument();
    expect(status()).not.toBeInTheDocument();
  });
});
