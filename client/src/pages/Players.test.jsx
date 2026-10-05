import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { Provider } from '../Context';
import { BrowserRouter } from 'react-router';

const mockRoles = [{ _id: 'role-1', name: 'Hard Carry' }];
const mockMedails = [{ _id: 'medail-1', name: 'Cruzado' }];

const NAMES = ['PlayerOne', 'PlayerTwo', 'PlayerThree', 'PlayerFour', 'PlayerFive'];

// Players come back ordered by mmr, so the rank is the position in this list.
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

function mockApi(players) {
  global.fetch = vi.fn((url) => {
    if (url.includes('players/getAllPlayers')) return jsonResponse(players);
    if (url.includes('scores/getScoreOfPlayers')) return jsonResponse(buildScores(players));
    if (url.includes('medails/getMedails')) return jsonResponse(mockMedails);
    if (url.includes('roles/getRoles')) return jsonResponse(mockRoles);
    if (url.includes('auth/me')) return jsonResponse({ authenticated: false });
    return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
  });
}

// Renders /players and waits until the page header is there (the app shows the
// splash until the data has loaded, so the cards are there too).
async function renderPlayers(playerCount) {
  mockApi(buildPlayers(playerCount));
  window.history.pushState({}, '', '/players');
  render(
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
  return screen.findByRole('heading', { level: 1, name: 'Jugadores' });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('the page header', () => {
  test('has the h1 "Jugadores" with the refresh button inside it, and no second one', async () => {
    const heading = await renderPlayers(5);

    const header = heading.closest('header');
    expect(header).not.toBeNull();
    expect(within(header).getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Actualizar' })).toHaveLength(1);
  });

  test('"Actualizar" fetches the data again', async () => {
    const user = userEvent.setup();
    await renderPlayers(5);
    const playersFetches = () =>
      global.fetch.mock.calls.filter(([url]) => url.includes('players/getAllPlayers')).length;
    expect(playersFetches()).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(playersFetches()).toBe(2));
    expect(await screen.findByRole('heading', { level: 1, name: 'Jugadores' })).toBeInTheDocument();
  });
});

describe('the player cards', () => {
  test('are one article per player, in rank order, each with a heading named after the player', async () => {
    await renderPlayers(5);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(5);
    cards.forEach((card, i) => {
      const heading = within(card).getByRole('heading', { name: NAMES[i] });
      expect(heading.tagName).toBe('H2');
      // The article is named by its heading.
      expect(card).toHaveAccessibleName(NAMES[i]);
    });
  });

  test('show the rank, the medal and the MMR in the card header', async () => {
    await renderPlayers(5);

    const [first, , , fourth] = screen.getAllByRole('article');
    const header = first.querySelector('header');
    expect(header).toHaveTextContent('1');
    expect(header).toHaveTextContent('Cruzado');
    expect(header).toHaveTextContent('2000');
    expect(fourth.querySelector('header')).toHaveTextContent('4');
  });

  test('name the metal in text for ranks 1 to 3, so color is never the only cue', async () => {
    await renderPlayers(5);

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveTextContent(/oro/i);
    expect(cards[1]).toHaveTextContent(/plata/i);
    expect(cards[2]).toHaveTextContent(/bronce/i);
    expect(cards[3]).not.toHaveTextContent(/oro|plata|bronce/i);
    expect(cards[4]).not.toHaveTextContent(/oro|plata|bronce/i);
  });

  test('have an avatar with the player name in its alt text', async () => {
    await renderPlayers(5);

    for (const name of NAMES) {
      expect(screen.getByRole('img', { name: `Foto de ${name}` })).toBeInTheDocument();
    }
  });

  test('are laid out with CSS, not with a measured width (no carousel)', async () => {
    await renderPlayers(5);

    expect(document.getElementById('playersCarousel')).not.toBeInTheDocument();
    expect(document.getElementById('CarouselWrapper')).not.toBeInTheDocument();
  });
});
