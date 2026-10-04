import React from 'react';
import { ImArrowRight2 } from 'react-icons/im';
import { Button } from './styles';
import { NAV_ID } from '../NavBar';

export const ShowMenuButton = ({ onClick, buttonRef }) => (
  <Button
    type='button'
    ref={buttonRef}
    onClick={onClick}
    aria-expanded='false'
    aria-controls={NAV_ID}
  >
    <ImArrowRight2 aria-hidden='true' />
    Mostrar menú
  </Button>
);
