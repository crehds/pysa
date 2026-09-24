import React from 'react';
import { LoggingWrapper } from './style';
import Swal from 'sweetalert2';
import { login, logout } from '../../api/auth';
import { BiLogIn, BiLogOut } from 'react-icons/bi';
import { BiRefresh } from 'react-icons/bi';
import { useStateValue } from '../../Context';

const MESSAGE_BY_REASON = {
  invalid: 'Lo más probable es que aún no eres digno',
  'rate-limited': 'Demasiados intentos, prueba de nuevo más tarde',
  'not-configured': 'El login de admin no está configurado',
  network: 'Error de red, inténtalo de nuevo',
  unknown: 'Lo más probable es que aún no eres digno',
};

export const Logging = (props) => {
  const [{}, dispatch] = useStateValue();

  async function loginMod() {
    const { value } = await Swal.fire({
      title: 'Login',
      html:
        '<input id="user" class="swal2-input">' +
        '<input id="password" type="password" class="swal2-input">',
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
        text: 'Bienvenido papu',
      });
    } else {
      Swal.fire({
        icon: 'error',
        text: MESSAGE_BY_REASON[value.reason] || MESSAGE_BY_REASON.unknown,
      });
    }
  }

  async function logoutMod() {
    return await Swal.fire({
      title: 'Te deslogueas papu?',
      showCancelButton: true,
      confirmButtonText: `Ñafo`,
      cancelButtonText: `Me quedo un rato más`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        dispatch({ type: 'UNLOGIN' });
        props.handleLogging(false);
        Swal.fire('Hasta pronto papu', '', 'success');
      }
    });
  }
  return (
    <LoggingWrapper>
      <BiRefresh
        size='35px'
        color='gray'
        className='logging__refresh'
        onClick={props.handleRefreshApp}
      />
      {props.isLogging ? (
        <div onClick={logoutMod}>
          <BiLogOut size='35px' title='Login' className='logging__door' />
          <p>Desloguéate</p>
        </div>
      ) : (
        <div onClick={loginMod}>
          <p>Loguéate</p>
          <BiLogIn size='35px' className='logging__door' />
        </div>
      )}
    </LoggingWrapper>
  );
};
