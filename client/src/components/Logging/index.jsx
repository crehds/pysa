import React from 'react';
import { AuthButton } from './style';
import Swal from 'sweetalert2';
import { login, logout } from '../../api/auth';
import { BiLogIn, BiLogOut } from 'react-icons/bi';
import { useStateValue } from '../../Context';
import { useLanguage } from '../../i18n/LanguageContext';

// Dictionary key of the message for each reason the login can fail.
const ERROR_KEY_BY_REASON = {
  invalid: 'login.error.invalid',
  'rate-limited': 'login.error.rateLimited',
  'not-configured': 'login.error.notConfigured',
  network: 'login.error.network',
  unknown: 'login.error.unknown',
};

export const Logging = (props) => {
  const [{}, dispatch] = useStateValue();
  const { t } = useLanguage();

  async function loginMod() {
    const { value } = await Swal.fire({
      title: t('login.title'),
      // Visible labels, tied to the inputs by id; #user and #password stay as
      // the hooks the tests and preConfirm use.
      html:
        `<label for="user" class="swal-label">${t('login.user')}</label>` +
        '<input id="user" class="swal2-input" autocomplete="username">' +
        `<label for="password" class="swal-label">${t('login.password')}</label>` +
        '<input id="password" type="password" class="swal2-input" autocomplete="current-password">',
      focusConfirm: false,
      preConfirm: async () => {
        let user = document.getElementById('user').value;
        let password = document.getElementById('password').value;
        return await login(user, password);
      },
    });
    if (value === undefined) {
      return null;
    }
    if (value.ok) {
      props.handleLogging(true);
      dispatch({ type: 'LOGIN' });
      Swal.fire({
        icon: 'success',
        text: t('login.success'),
      });
    } else {
      Swal.fire({
        icon: 'error',
        text: t(ERROR_KEY_BY_REASON[value.reason] ?? ERROR_KEY_BY_REASON.unknown),
      });
    }
  }

  async function logoutMod() {
    return await Swal.fire({
      title: t('logout.title'),
      showCancelButton: true,
      confirmButtonText: t('logout.confirm'),
      cancelButtonText: t('logout.cancel'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        dispatch({ type: 'UNLOGIN' });
        props.handleLogging(false);
        Swal.fire(t('logout.done'), '', 'success');
      }
    });
  }
  return props.isLogging ? (
    <AuthButton type='button' onClick={logoutMod}>
      <BiLogOut aria-hidden='true' />
      {t('auth.logout')}
    </AuthButton>
  ) : (
    <AuthButton type='button' onClick={loginMod}>
      <BiLogIn aria-hidden='true' />
      {t('auth.login')}
    </AuthButton>
  );
};
