import React from 'react';
import { Box, Hint, Message } from './styles';

export const EmptyRanking = () => (
  <Box>
    <Message>Todavía no hay jugadores en el ranking.</Message>
    <Hint>Aparecerán aquí cuando terminen su calibración.</Hint>
  </Box>
);
