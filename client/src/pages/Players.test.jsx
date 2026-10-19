import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { RoleStats } from '../components/Player/RoleStats';
import { Provider } from '../Context';
import { BrowserRouter } from 'react-router';

const mockRoles = [
  { _id: 'role-1', name: 'Hard Carry' },
  { _id: 'role-2', name: 'Mid Laner' },
];
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
      {
        rol: 'role-2',
        victories: 3,
        victoriesDouble: 1,
        defeats: 1,
        defeatsDouble: 1,
        kills: 8,
        deaths: 5,
        assists: 6,
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

describe('the role stats', () => {
  async function firstCardTable() {
    await renderPlayers(5);
    const card = screen.getAllByRole('article')[0];
    return within(card).getByRole('table', { name: 'Estadísticas por rol de PlayerOne' });
  }

  test('are a table in each card, captioned with the player name', async () => {
    await renderPlayers(5);

    for (const [i, card] of screen.getAllByRole('article').entries()) {
      const table = within(card).getByRole('table', {
        name: `Estadísticas por rol de ${NAMES[i]}`,
      });
      expect(table.querySelector('caption')).toHaveTextContent(
        `Estadísticas por rol de ${NAMES[i]}`
      );
    }
  });

  test('have a column header for the role and each stat, with full accessible names', async () => {
    const table = await firstCardTable();

    const headers = within(table).getAllByRole('columnheader');
    // "Rol" and the two group labels come first (the first header row), then the stats.
    expect(headers.map((header) => header.getAttribute('scope'))).toEqual([
      'col',
      'colgroup',
      'colgroup',
      ...Array(7).fill('col'),
    ]);
    // The visible text is short ("V", "D x2"); the accessible name is the full word.
    expect(headers.map((header) => header.textContent)).toEqual([
      'Rol',
      'Resultados',
      'KDA',
      'VVictorias',
      'V x2Victorias dobles',
      'DDerrotas',
      'D x2Derrotas dobles',
      'KAsesinatos',
      'DMuertes',
      'AAsistencias',
    ]);
    for (const name of [
      'Rol',
      'Victorias',
      'Victorias dobles',
      'Derrotas',
      'Derrotas dobles',
      'Asesinatos',
      'Muertes',
      'Asistencias',
    ]) {
      expect(within(table).getByRole('columnheader', { name })).toBeInTheDocument();
    }
  });

  test('group the headers: "Resultados" over the wins and defeats, "KDA" over the rest', async () => {
    const table = await firstCardTable();

    const results = within(table).getByRole('columnheader', { name: 'Resultados' });
    const kda = within(table).getByRole('columnheader', { name: 'KDA' });
    expect(results).toHaveAttribute('scope', 'colgroup');
    expect(results).toHaveAttribute('colspan', '4');
    expect(kda).toHaveAttribute('scope', 'colgroup');
    expect(kda).toHaveAttribute('colspan', '3');
    // "Rol" spans both header rows.
    expect(within(table).getByRole('columnheader', { name: 'Rol' })).toHaveAttribute(
      'rowspan',
      '2'
    );
    // A <colgroup> per group, matching the spans: the role column, then 4 and 3.
    const groups = [...table.querySelectorAll('colgroup')];
    expect(groups.map((group) => group.querySelectorAll('col').length)).toEqual([1, 4, 3]);
  });

  test('list one row per role with its numbers', async () => {
    const table = await firstCardTable();

    const [, , carry, mid] = within(table).getAllByRole('row');
    expect(
      within(carry)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['5', '0', '2', '0', '20', '10', '15']);
    expect(within(carry).getByRole('rowheader', { name: 'Hard Carry' })).toBeInTheDocument();
    expect(within(mid).getByRole('rowheader', { name: 'Mid Laner' })).toBeInTheDocument();
    expect(
      within(mid)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['3', '1', '1', '1', '8', '5', '6']);
  });

  test('end with a labeled totals row in the table footer', async () => {
    const table = await firstCardTable();

    const footer = table.querySelector('tfoot');
    expect(footer).not.toBeNull();
    const totals = within(footer).getByRole('row');
    expect(within(totals).getByRole('rowheader', { name: 'Total' })).toBeInTheDocument();
    // Victories and defeats include the x2 ones: 5+0+3+1, 2+0+1+1.
    expect(
      within(totals)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['9', '4', '28', '15', '21']);
  });

  test('show the games played and the KDA next to the table', async () => {
    await renderPlayers(5);

    const card = screen.getAllByRole('article')[0];
    expect(within(card).getByText('Partidas').nextSibling).toHaveTextContent('13');
    expect(within(card).getByText('KDA', { selector: 'dt' }).nextSibling).toHaveTextContent('3.27');
  });

  test('derive the games played when the player has no "partidas" (the x2 ones count)', () => {
    const roles = [
      { rol: 'Hard Carry', victories: 5, victoriesDouble: 0, defeats: 2, defeatsDouble: 0, kills: 20, deaths: 10, assists: 15 },
      { rol: 'Mid Laner', victories: 3, victoriesDouble: 1, defeats: 1, defeatsDouble: 1, kills: 8, deaths: 5, assists: 6 },
    ];
    render(
      <Provider>
        <RoleStats name='PlayerOne' roles={roles} kda='3.27' />
      </Provider>
    );

    expect(screen.getByText('Partidas').nextSibling).toHaveTextContent('13');
  });
});
