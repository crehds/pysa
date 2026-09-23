import { render, fireEvent } from '@testing-library/react';
import { PlayerFocus } from './index';
import { Provider } from '../../../Context';

// medail: 'Sin Calibrar' with partidas well under 10 takes
// handleUpdateMedail's no-lookup branch, so this player never needs the
// medails list from context.
const player = {
  _id: 'player-1',
  nickname: 'PlayerOne',
  medail: 'Sin Calibrar',
  partidas: 0,
  mmr: 1500,
  rolesScore: [],
  imgURL: '/default/default-user.png',
};

function renderPlayerFocus() {
  // useGetWidth() (client/src/hooks/useGetWidth.js) reads
  // document.getElementById('app').offsetWidth, so PlayerFocus needs that
  // ancestor id to render at all, matching the real #app root in App.jsx.
  const container = document.createElement('div');
  container.id = 'app';
  document.body.appendChild(container);
  return render(
    <Provider>
      <PlayerFocus player={player} />
    </Provider>,
    { container }
  );
}

test('selecting a file does not throw and reveals the confirm/cancel controls', () => {
  const { container } = renderPlayerFocus();
  const fileInput = container.querySelector('#input_to_setImage');
  const file = new File(['fake-bytes'], 'avatar.png', { type: 'image/png' });

  // Regression test: handleShowIcons used to look the check/cancel icons up
  // with document.getElementsByName('check'), but both render as <svg
  // name="check">, and getElementsByName only matches the HTML namespace,
  // so it silently found nothing and selecting a file threw
  // "Cannot read properties of undefined (reading 'style')" instead of
  // revealing the confirm/cancel controls.
  expect(() => {
    fireEvent.change(fileInput, { target: { files: [file] } });
  }).not.toThrow();

  const icons = container.getElementsByClassName('icon__control');
  expect(icons).toHaveLength(2);
  expect(icons[0].style.display).toBe('block');
  expect(icons[1].style.display).toBe('block');
});
