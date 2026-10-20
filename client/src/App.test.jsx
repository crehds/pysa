import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { Provider } from './Context';
import { BrowserRouter } from 'react-router';
import Swal from 'sweetalert2';

// The login/logout dialogs are SweetAlert2 modals; these tests only check that
// the buttons start those flows, so the dialog itself is replaced.
vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => Promise.resolve({})) },
}));

const mockRoles = [{ _id: 'role-1', name: 'Hard Carry' }];
const mockMedails = [{ _id: 'medail-1', name: 'Cruzado' }];
const mockPlayers = [
  {
    _id: 'player-1',
    nickname: 'PlayerOne',
    estado: true,
    medail: 'medail-1',
    mmr: 1500,
    imgURL: '/default/default-user.png',
  },
  {
    _id: 'player-2',
    nickname: 'PlayerTwo',
    estado: true,
    medail: 'medail-1',
    mmr: 1400,
    imgURL: '/default/default-user.png',
  },
];
const mockScorePlayers = [
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
  {
    playerId: 'player-2',
    rolesScore: [
      {
        rol: 'role-1',
        victories: 3,
        victoriesDouble: 0,
        defeats: 4,
        defeatsDouble: 0,
        kills: 15,
        deaths: 12,
        assists: 10,
      },
    ],
  },
];

// Backend responses are always shaped { error, body }.
function jsonResponse(body, status = 200) {
  return Promise.resolve({ status, json: () => Promise.resolve({ error: '', body }) });
}

function mockFetch(url, options) {
  if (url.includes('players/getAllPlayers')) {
    return jsonResponse(mockPlayers);
  }
  if (url.includes('scores/getScoreOfPlayers')) {
    return jsonResponse(mockScorePlayers);
  }
  if (url.includes('medails/getMedails')) {
    return jsonResponse(mockMedails);
  }
  if (url.includes('roles/getRoles')) {
    return jsonResponse(mockRoles);
  }
  if (url.includes('auth/me')) {
    // None of these tests simulate a logged-in admin; useCheckAuth
    // (client/src/hooks/useCheckAuth.js) fires this on every mount. The
    // session check itself always answers 200 (see backend/auth/network.js);
    // "not logged in" is authenticated: false, not an HTTP error.
    return jsonResponse({ authenticated: false });
  }
  return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
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

const MENU_KEY = 'pysa:menu';

beforeEach(() => {
  global.fetch = mockFetch;
  window.localStorage.clear();
  vi.mocked(Swal.fire).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('the ranking at / renders player names from the mocked api', async () => {
  renderAppAt('/');

  expect(await screen.findByText('PlayerOne')).toBeInTheDocument();
  expect(screen.getByText('PlayerTwo')).toBeInTheDocument();
});

test('/players renders the player cards', async () => {
  renderAppAt('/players');

  const names = await screen.findAllByText('PlayerOne');
  expect(names.length).toBeGreaterThan(0);
});

test('/adminPlayers redirects to / when logged out', async () => {
  renderAppAt('/adminPlayers');

  // A logged-out visitor never reaches the admin carousel; they land back on
  // the ranking, which renders the same players as the `/` test above.
  expect(await screen.findByText('PlayerOne')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: 'Ranking' })).toBeInTheDocument();
});

test('the initial render does not move focus to the route container', async () => {
  renderAppAt('/');

  await screen.findByText('PlayerOne');

  const routeContainer = screen.getByRole('main');
  expect(document.activeElement).not.toBe(routeContainer);
});

test('navigating to another route moves focus to the route container, so screen readers announce it', async () => {
  const user = userEvent.setup();
  renderAppAt('/');
  await screen.findByText('PlayerOne');

  const routeContainer = screen.getByRole('main');
  const playersLink = document.querySelector('a[href="/players"]');

  await user.click(playersLink);

  const names = await screen.findAllByText('PlayerOne');
  expect(names.length).toBeGreaterThan(0);
  expect(document.activeElement).toBe(routeContainer);
});

describe('app shell', () => {
  test('the nav links have accessible names', async () => {
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    expect(screen.getByRole('link', { name: 'Ranking' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Jugadores' })).toHaveAttribute(
      'href',
      '/players'
    );
  });

  test('there is exactly one navigation landmark', async () => {
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    expect(screen.getAllByRole('navigation')).toHaveLength(1);
  });

  test('the external game link opens safely and has a name', async () => {
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    const link = screen.getByRole('link', { name: 'Juego' });
    expect(link).toHaveAttribute('href', 'https://game-with-keyboard.vercel.app/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('"Iniciar sesión" is a button inside the navigation', async () => {
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    const button = screen.getByRole('button', { name: 'Iniciar sesión' });
    expect(screen.getByRole('navigation')).toContainElement(button);
  });

  test('"Actualizar" is a button', async () => {
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
  });

  test('the link of the current page is marked with aria-current', async () => {
    const user = userEvent.setup();
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    expect(screen.getByRole('link', { name: 'Ranking' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Jugadores' })).not.toHaveAttribute(
      'aria-current'
    );

    await user.click(screen.getByRole('link', { name: 'Jugadores' }));
    // Only the Players page has the "Jugadores" heading (the ranking also shows the names).
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Jugadores' })
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Jugadores' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Ranking' })).not.toHaveAttribute(
      'aria-current'
    );
  });
});

describe('hiding the menu', () => {
  test('the menu is visible by default and only the hide button is offered', async () => {
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    const hide = screen.getByRole('button', { name: 'Ocultar menú' });
    expect(hide).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation')).toContainElement(hide);
    expect(screen.queryByRole('button', { name: 'Mostrar menú' })).not.toBeInTheDocument();
  });

  test('hiding shows the "Mostrar menú" button, reports collapsed, stores the choice and moves focus', async () => {
    const user = userEvent.setup();
    renderAppAt('/');
    await screen.findByText('PlayerOne');
    const nav = screen.getByRole('navigation');

    await user.click(screen.getByRole('button', { name: 'Ocultar menú' }));

    const show = screen.getByRole('button', { name: 'Mostrar menú' });
    expect(show).toHaveAttribute('aria-expanded', 'false');
    expect(show).toHaveAttribute('aria-controls', nav.id);
    expect(screen.getByRole('button', { name: 'Ocultar menú' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(nav.id).not.toBe('');
    expect(window.localStorage.getItem(MENU_KEY)).toBe('hidden');
    expect(show).toHaveFocus();
  });

  test('showing goes back to expanded, stores the choice and moves focus to the hide button', async () => {
    const user = userEvent.setup();
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    await user.click(screen.getByRole('button', { name: 'Ocultar menú' }));
    await user.click(screen.getByRole('button', { name: 'Mostrar menú' }));

    const hide = screen.getByRole('button', { name: 'Ocultar menú' });
    expect(hide).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('button', { name: 'Mostrar menú' })).not.toBeInTheDocument();
    expect(window.localStorage.getItem(MENU_KEY)).toBe('visible');
    expect(hide).toHaveFocus();
  });

  test('a stored "hidden" choice is restored on load', async () => {
    window.localStorage.setItem(MENU_KEY, 'hidden');
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    expect(screen.getByRole('button', { name: 'Mostrar menú' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ocultar menú' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('blocked storage keeps the menu visible and toggling does not crash', async () => {
    const user = userEvent.setup();
    // Only localStorage is blocked here: a blocked sessionStorage would play
    // the staged intro (see App.intro.test.jsx).
    const { getItem, setItem } = Storage.prototype;
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (key) {
      if (this === window.localStorage) throw new Error('blocked');
      return getItem.call(this, key);
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (this === window.localStorage) throw new Error('blocked');
      return setItem.call(this, key, value);
    });
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    expect(screen.queryByRole('button', { name: 'Mostrar menú' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ocultar menú' }));
    expect(screen.getByRole('button', { name: 'Mostrar menú' })).toBeInTheDocument();
  });
});

describe('the shell controls are wired', () => {
  function playersFetches() {
    return vi
      .mocked(global.fetch)
      .mock.calls.filter(([url]) => url.includes('players/getAllPlayers')).length;
  }

  test('"Actualizar" fetches the data again', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn(mockFetch);
    renderAppAt('/');
    await screen.findByText('PlayerOne');
    expect(playersFetches()).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(playersFetches()).toBe(2));
    expect(await screen.findByText('PlayerOne')).toBeInTheDocument();
  });

  test('"Iniciar sesión" starts the login dialog', async () => {
    const user = userEvent.setup();
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Iniciar sesión' }));
  });

  describe('when an admin session is active', () => {
    beforeEach(() => {
      global.fetch = vi.fn((url, options) =>
        url.includes('auth/me')
          ? jsonResponse({ authenticated: true })
          : mockFetch(url, options)
      );
    });

    test('the "Admin" link shows and "Cerrar sesión" replaces "Iniciar sesión"', async () => {
      renderAppAt('/');
      await screen.findByText('PlayerOne');

      expect(await screen.findByRole('link', { name: 'Admin' })).toHaveAttribute(
        'href',
        '/adminPlayers'
      );
      expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
    });

    test('"Cerrar sesión" starts the logout dialog', async () => {
      const user = userEvent.setup();
      renderAppAt('/');
      await screen.findByText('PlayerOne');

      await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ title: '¿Cerrar sesión?' })
      );
    });
  });
});
