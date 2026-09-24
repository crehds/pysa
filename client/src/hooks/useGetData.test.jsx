import { renderHook, waitFor } from '@testing-library/react';
import { useGetData } from './useGetData';
import { Provider } from '../Context';
import { API_BASE_URL } from '../config';

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
];

// Backend responses are always shaped { error, body }.
function jsonResponse(body) {
  return Promise.resolve({ json: () => Promise.resolve({ error: '', body }) });
}

function mockFetch(url) {
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

function wrapper({ children }) {
  return <Provider>{children}</Provider>;
}

beforeEach(() => {
  global.fetch = vi.fn(mockFetch);
});

test('requests the four resources at API_BASE_URL on the initial load', async () => {
  const { result } = renderHook(() => useGetData(false), { wrapper });

  await waitFor(() => expect(result.current[0]).toBe(true));

  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/players/getAllPlayers`
  );
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/medails/getMedails`
  );
  expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/roles/getRoles`);
  expect(global.fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/scores/getScoreOfPlayers`,
    expect.objectContaining({
      method: 'post',
      body: JSON.stringify({ playersIds: ['player-1'] }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
});

test('does not fetch anything when the app already finished loading', () => {
  renderHook(() => useGetData(true), { wrapper });

  expect(global.fetch).not.toHaveBeenCalled();
});
