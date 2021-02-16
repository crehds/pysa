import React from 'react';
import logo from '../../assets/logo_pysa_5.png';
import { Div, Img, ImgWrapper, Overlay } from './styles.jsx';

export const Loading = () => {
  return (
    <Div>
      <Overlay />
      <ImgWrapper>
        <Img width='480px' src={logo} alt='logo de pysa' />
      </ImgWrapper>
    </Div>
  );
};
