import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { Provider } from './Context';
import { BrowserRouter } from 'react-router';

// Every public page in each language. The Spanish copy is also asserted all over
// the other suites (they run in Spanish); this file proves the English side, the
// switch re-rendering the page, and that the database's medal names are only
// translated for display.
const NAMES = ['PlayerOne', 'PlayerTwo', 'PlayerThree', 'PlayerFour'];

function buildPlayers(count) {
  return NAMES.slice(0, count).map((nickname, i) => ({
    _id: `player-${i + 1}`,
    nickname,
    estado: true,
    medail: 'medail-1',
    mmr: 2000 - i * 100,
    imgURL: '/default/default-user.png',
  }));
}

function buildScores(players) {
  return players.map((player) => ({
    playerId: player._id,
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
  }));
}

function jsonResponse(body) {
  return Promise.resolve({ status: 200, json: () => Promise.resolve({ error: '', body }) });
}

function mockApi(players, { failPlayers = false } = {}) {
  global.fetch = vi.fn((url) => {
    if (url.includes('players/getAllPlayers')) {
      return failPlayers ? Promise.reject(new TypeError('Failed to fetch')) : jsonResponse(players);
    }
    if (url.includes('scores/getScoreOfPlayers')) return jsonResponse(buildScores(players));
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

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('in English', () => {
  beforeEach(() => setBrowserLanguages(['en-US', 'en']));

  test('the menu and its controls', async () => {
    mockApi(buildPlayers(4));
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('link', { name: 'Ranking' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Players' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Game' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Hide menu' })).toBeInTheDocument();
    // The logo link is hidden on phones (jsdom ignores the media query, so it
    // reads as hidden here).
    expect(within(nav).getByRole('img', { name: 'Pysa logo', hidden: true })).toBeInTheDocument();
  });

  test('Home: header, podium, table and footer', async () => {
    mockApi(buildPlayers(4));
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    expect(screen.getByRole('heading', { level: 1, name: 'Ranking' })).toBeInTheDocument();
    expect(
      screen.getByText('Pysa Dota 2 community ranking, ordered by MMR.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medal ranges' })).toBeInTheDocument();

    // The podium names the metal in text and shows the medal in English.
    const podium = screen.getByRole('list', { name: 'Podium' });
    const items = within(podium).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('1, gold');
    expect(items[1]).toHaveTextContent('2, silver');
    expect(items[2]).toHaveTextContent('3, bronze');
    expect(items[0]).toHaveTextContent('Crusader');
    expect(items[0]).not.toHaveTextContent('Cruzado');

    const table = screen.getByRole('table', { name: 'Ranking' });
    const headers = within(table).getAllByRole('columnheader', { hidden: true });
    expect(headers.map((header) => header.textContent.trim())).toEqual([
      '#',
      'Player',
      'Games',
      'MMR',
      'KDA',
      'Medal',
    ]);
    expect(within(table).getByText('Crusader')).toBeInTheDocument();

    const footerLink = screen.getByRole('link', { name: /Code on GitHub/ });
    expect(footerLink).toHaveTextContent('(opens in a new tab)');
    expect(screen.getByText('Pysa. Built with React, Express and MongoDB.')).toBeInTheDocument();
  });

  test('Home: the medal ranges list the medals in English', async () => {
    const user = userEvent.setup();
    mockApi(buildPlayers(1));
    renderAppAt('/');
    await screen.findByText('PlayerOne');
    await user.click(screen.getByRole('button', { name: 'Medal ranges' }));

    const panel = document.getElementById('medails');
    for (const text of ['Min', 'Max', 'Medal', 'Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal']) {
      expect(within(panel).getByText(text)).toBeInTheDocument();
    }
    expect(within(panel).queryByText('Heraldo')).not.toBeInTheDocument();
  });

  test('Home: the empty state', async () => {
    mockApi([]);
    renderAppAt('/');

    expect(await screen.findByText('There are no players in the ranking yet.')).toBeInTheDocument();
    expect(
      screen.getByText('They will show up here once they finish their calibration.')
    ).toBeInTheDocument();
  });

  test('the splash is named in English while loading', async () => {
    mockApi(buildPlayers(1));
    renderAppAt('/');

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.getByAltText('Pysa logo')).toBeInTheDocument();
    await screen.findByText('PlayerOne');
  });

  test('the error state and its retry', async () => {
    mockApi([], { failPlayers: true });
    renderAppAt('/');

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load the ranking.');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  test('Players: title, cards and role stats', async () => {
    mockApi(buildPlayers(2));
    renderAppAt('/players');

    expect(await screen.findByRole('heading', { level: 1, name: 'Players' })).toBeInTheDocument();
    await screen.findByRole('list', { name: 'Player list' });
    expect(screen.getByRole('img', { name: 'Photo of PlayerOne' })).toBeInTheDocument();

    const table = screen.getAllByRole('table', { name: 'Stats by role for PlayerOne' })[0];
    expect(within(table).getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Results' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'KDA' })).toBeInTheDocument();
    for (const name of ['Wins', 'Double wins', 'Losses', 'Double losses', 'Kills', 'Deaths', 'Assists']) {
      expect(within(table).getByRole('columnheader', { name })).toBeInTheDocument();
    }
    expect(within(table).getByRole('rowheader', { name: 'Total' })).toBeInTheDocument();

    const card = screen.getAllByRole('article')[0];
    expect(within(card).getByText('Games')).toBeInTheDocument();
    expect(card).toHaveTextContent('1, gold');
    expect(within(card).getByText('Crusader')).toBeInTheDocument();
  });

  test('Players with no players shows the empty state in English', async () => {
    mockApi([]);
    renderAppAt('/players');

    expect(await screen.findByText('There are no players in the ranking yet.')).toBeInTheDocument();
  });
});

describe('switching language re-renders the page', () => {
  test('Spanish to English and back, without reloading the data', async () => {
    const user = userEvent.setup();
    setBrowserLanguages(['es-ES']);
    mockApi(buildPlayers(4));
    renderAppAt('/');
    await screen.findByText('PlayerOne');
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Podio' })).getAllByRole('listitem')[0]).toHaveTextContent('Cruzado');
    const requests = global.fetch.mock.calls.length;

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Podium' })).getAllByRole('listitem')[0]).toHaveTextContent('Crusader');

    await user.click(screen.getByRole('button', { name: 'Español' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument());
    expect(within(screen.getByRole('list', { name: 'Podio' })).getAllByRole('listitem')[0]).toHaveTextContent('Cruzado');
    expect(global.fetch.mock.calls.length).toBe(requests);
  });
});

describe('in Spanish', () => {
  test('the spoken labels use neutral Spanish', async () => {
    setBrowserLanguages(['es-MX']);
    mockApi(buildPlayers(4));
    renderAppAt('/');
    await screen.findByText('PlayerOne');

    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(within(nav).getByRole('img', { name: 'logo de pysa', hidden: true })).toBeInTheDocument();
    expect(screen.getByText('Pysa. Hecho con React, Express y MongoDB.')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Ranking' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/papu|ñafo|logue/i);
  });
});
