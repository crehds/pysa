import React from 'react';
import { LoggingWrapper } from './style';
import Swal from 'sweetalert2';
import { login } from '../../api/login.json';
import { BiLogIn, BiLogOut } from 'react-icons/bi';

export const Logging = (props) => {
  function handleLogging(user, password) {
    return login.some(
      (element) => element.id === user && element.password === password
    );
  }

  async function loginMod() {
    const { value } = await Swal.fire({
      title: 'Login',
      html:
        '<input id="user" class="swal2-input">' +
        '<input id="password" type="password" class="swal2-input">',
      focusConfirm: false,
      preConfirm: () => {
        let user = document.getElementById('user').value;
        let password = document.getElementById('password').value;
        console.log('aqui');
        let result = { status: handleLogging(user, password) };
        return result;
      },
    });
    if (value === undefined) {
      return null;
    }
    if (value.status) {
      props.handleLogging(value.status);
      Swal.fire({
        icon: 'success',
        text: 'Bienvenido papu',
      });
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Lo más probable es que aún no eres digno',
      });
    }
  }

  async function logoutMod() {
    return await Swal.fire({
      title: 'Te deslogueas papu?',
      showCancelButton: true,
      confirmButtonText: `Ñafo`,
      cancelButtonText: `Me quedo un rato más`,
    }).then((result) => {
      if (result.isConfirmed) {
        props.handleLogging(false);
        Swal.fire('Hasta pronto papu', '', 'success');
      }
    });
  }
  return (
    <LoggingWrapper>
      {props.isLogging ? (
        <div onClick={logoutMod}>
          <BiLogOut size='35px' title='Login' />
          <p>Desloguéate</p>
        </div>
      ) : (
        <div onClick={loginMod}>
          <p>Loguéate</p>
          <BiLogIn size='35px' />
        </div>
      )}
    </LoggingWrapper>
  );
};
