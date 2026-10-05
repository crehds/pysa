import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import { Provider } from '../../Context';
import { Logging } from './index';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => Promise.resolve({})) },
}));

function renderLogging() {
  return render(
    <Provider>
      <Logging isLogging={false} handleLogging={() => {}} />
    </Provider>
  );
}

test('the login dialog labels its fields, keeping the #user and #password hooks', async () => {
  const user = userEvent.setup();
  renderLogging();

  await user.click(screen.getByRole('button', { name: 'Loguéate' }));

  const { html } = vi.mocked(Swal.fire).mock.calls[0][0];
  const dialog = document.createElement('div');
  dialog.innerHTML = html;
  document.body.append(dialog);

  // Visible labels tied to the inputs (not placeholders or bare inputs).
  const userField = screen.getByLabelText('Usuario');
  const passwordField = screen.getByLabelText('Contraseña');
  expect(userField).toHaveAttribute('id', 'user');
  expect(passwordField).toHaveAttribute('id', 'password');
  expect(passwordField).toHaveAttribute('type', 'password');
  expect(userField).toHaveAttribute('autocomplete', 'username');
  expect(passwordField).toHaveAttribute('autocomplete', 'current-password');
  dialog.remove();
});
