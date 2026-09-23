import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { Provider } from './Context';
import { BrowserRouter } from 'react-router';

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
function jsonResponse(body) {
  return Promise.resolve({ json: () => Promise.resolve({ error: '', body }) });
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

beforeEach(() => {
  global.fetch = mockFetch;
});

test('the ranking at / renders player names from the mocked api', async () => {
  renderAppAt('/');

  expect(await screen.findByText('PlayerOne')).toBeInTheDocument();
  expect(screen.getByText('PlayerTwo')).toBeInTheDocument();
});

test('/players renders the players carousel', async () => {
  renderAppAt('/players');

  const names = await screen.findAllByText('PlayerOne');
  expect(names.length).toBeGreaterThan(0);
});

test('/adminPlayers redirects to / when logged out', async () => {
  renderAppAt('/adminPlayers');

  // A logged-out visitor never reaches the admin carousel; they land back on
  // the ranking, which renders the same player rows as the `/` test above.
  expect(await screen.findByText('PlayerOne')).toBeInTheDocument();
  expect(screen.getByText('Nº Partidas')).toBeInTheDocument();
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
