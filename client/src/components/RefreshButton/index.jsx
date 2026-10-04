import React from 'react';
import { BiRefresh } from 'react-icons/bi';
import { Button } from './styles';

export const RefreshButton = ({ onClick }) => (
  <Button type='button' onClick={onClick}>
    <BiRefresh aria-hidden='true' />
    Actualizar
  </Button>
);
