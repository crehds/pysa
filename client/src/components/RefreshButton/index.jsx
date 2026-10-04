import React from 'react';
import { BiRefresh } from 'react-icons/bi';
import { Button } from './styles';

// `floating` is for pages that have no page header to hold it.
export const RefreshButton = ({ onClick, floating = false }) => (
  <Button type='button' onClick={onClick} $floating={floating}>
    <BiRefresh aria-hidden='true' />
    Actualizar
  </Button>
);
