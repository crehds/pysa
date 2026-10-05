import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
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

function fetchesTo(path) {
  return global.fetch.mock.calls.filter(([url]) => url.includes(path)).length;
}

function renderAppAt(playerCount, path) {
  mockApi(buildPlayers(playerCount));
  window.history.pushState({}, '', path);
  render(
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}

// Renders Home and waits until the data has loaded, not just the page header:
// with players, until the podium lists them; with none, until the fetches ran
// and the app left the splash.
async function renderHome(playerCount) {
  renderAppAt(playerCount, '/');
  const heading = await screen.findByRole('heading', { level: 1, name: 'Ranking' });
  if (playerCount > 0) {
    await screen.findByRole('list', { name: 'Podio' });
    await screen.findByText(NAMES[0]);
  } else {
    await waitFor(() => expect(fetchesTo('roles/getRoles')).toBe(1));
    await waitFor(() => expect(screen.queryByAltText('logo de pysa')).not.toBeInTheDocument());
  }
  return heading;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the page header', () => {
  test('has the h1 "Ranking" with the refresh button and the medal ranges button inside it', async () => {
    const heading = await renderHome(5);

    const header = heading.closest('header');
    expect(header).not.toBeNull();
    expect(within(header).getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(
      within(header).getByRole('button', { name: 'Rangos de medallas' })
    ).toBeInTheDocument();
  });

  test('introduces the page as the Pysa Dota 2 community ranking', async () => {
    const heading = await renderHome(5);

    expect(within(heading.closest('header')).getByText(
      'Clasificación de la comunidad Pysa de Dota 2, ordenada por MMR.'
    )).toBeInTheDocument();
  });

});

describe('the podium', () => {
  test('lists the top three, in rank order, with name and MMR', async () => {
    await renderHome(5);

    const podium = screen.getByRole('list', { name: 'Podio' });
    const items = within(podium).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    const expected = [
      ['PlayerOne', '2000', /oro/i],
      ['PlayerTwo', '1900', /plata/i],
      ['PlayerThree', '1800', /bronce/i],
    ];
    expected.forEach(([name, mmr, label], i) => {
      expect(within(items[i]).getByText(name)).toBeInTheDocument();
      expect(within(items[i]).getByText(mmr)).toBeInTheDocument();
      // The metal is never the only cue: the rank and its name are text.
      expect(items[i]).toHaveTextContent(String(i + 1));
      expect(items[i]).toHaveTextContent(label);
    });
  });

  test('with two players it shows two items and no table', async () => {
    await renderHome(2);

    const items = within(screen.getByRole('list', { name: 'Podio' })).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('with one player it shows one item', async () => {
    await renderHome(1);

    const items = within(screen.getByRole('list', { name: 'Podio' })).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('the ranking table', () => {
  test('lists the rest of the players, starting at rank 4', async () => {
    await renderHome(5);

    const table = screen.getByRole('table', { name: 'Ranking' });
    const [, first, second, ...others] = within(table).getAllByRole('row');
    expect(others).toHaveLength(0);
    expect(within(first).getAllByRole('cell')[0]).toHaveTextContent('4');
    expect(within(first).getByRole('cell', { name: 'PlayerFour' })).toBeInTheDocument();
    expect(within(first).getByRole('cell', { name: '1700' })).toBeInTheDocument();
    expect(within(second).getAllByRole('cell')[0]).toHaveTextContent('5');
    expect(within(second).getByRole('cell', { name: 'PlayerFive' })).toBeInTheDocument();
  });

  test('has the six column headers, in order', async () => {
    await renderHome(5);

    const table = screen.getByRole('table', { name: 'Ranking' });
    // jsdom ignores media queries, so the phone-hidden columns count as hidden
    // there; the e2e suite checks what each viewport really shows.
    const headers = within(table).getAllByRole('columnheader', { hidden: true });
    expect(headers.map((header) => header.textContent.trim())).toEqual([
      '#',
      'Player',
      'Nº Partidas',
      'MMR',
      'KDA',
      'Medalla',
    ]);
    for (const header of headers) {
      expect(header).toHaveAttribute('scope', 'col');
    }
  });
});

describe('the empty state', () => {
  test('explains there are no players, with no podium and no table', async () => {
    await renderHome(0);

    expect(screen.getByText('Todavía no hay jugadores en el ranking.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Podio' })).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('the medal ranges', () => {
  test('a real button toggles a disclosure; Escape closes it and returns focus', async () => {
    const user = userEvent.setup();
    await renderHome(5);

    const button = screen.getByRole('button', { name: 'Rangos de medallas' });
    const ranges = document.getElementById('medails');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'medails');
    expect(ranges).not.toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(ranges).toBeVisible();
    expect(within(ranges).getByText('Inmortal')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(ranges).not.toBeVisible();
    expect(button).toHaveFocus();
  });

  test('Escape inside a dialog leaves the ranges alone and does not pull focus to their button', async () => {
    const user = userEvent.setup();
    await renderHome(5);
    const button = screen.getByRole('button', { name: 'Rangos de medallas' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // A SweetAlert2 dialog is open (login, logout): Escape belongs to it.
    // jsdom has no layout, so SweetAlert2 can't measure the popup: say it's open.
    vi.spyOn(Swal, 'isVisible').mockReturnValue(true);
    const dialog = document.createElement('div');
    dialog.className = 'swal2-container';
    const input = document.createElement('input');
    dialog.append(input);
    document.body.append(dialog);
    input.focus();

    await user.keyboard('{Escape}');
    expect(input).toHaveFocus();
    expect(button).not.toHaveFocus();
    expect(button).toHaveAttribute('aria-expanded', 'true');
    dialog.remove();
  });

  test('Escape works again while a closing dialog still leaves its container in the page', async () => {
    const user = userEvent.setup();
    await renderHome(5);
    const button = screen.getByRole('button', { name: 'Rangos de medallas' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // SweetAlert2 keeps its container during the hide animation, but no dialog
    // is open any more, so Escape is the ranges' again.
    vi.spyOn(Swal, 'isVisible').mockReturnValue(false);
    const leftover = document.createElement('div');
    leftover.className = 'swal2-container';
    document.body.append(leftover);

    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
    leftover.remove();
  });

  test('works from the keyboard', async () => {
    const user = userEvent.setup();
    await renderHome(5);

    const button = screen.getByRole('button', { name: 'Rangos de medallas' });
    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('the footer', () => {
  test('links to the GitHub repository safely and adds no second navigation landmark', async () => {
    await renderHome(5);

    const link = screen.getByRole('link', { name: /GitHub/ });
    expect(link).toHaveAttribute('href', 'https://github.com/crehds/pysa');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.closest('footer')).not.toBeNull();
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
  });
});
