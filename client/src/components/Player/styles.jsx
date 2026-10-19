import styled from 'styled-components';
import { metalColors } from '../../styles/podium';

// A flat card. Ranks 1-3 get a thin metal top border; the non-color cue is the
// rank badge and its hidden "oro/plata/bronce" (see PlayerImageMedail).
export const Card = styled.article`
  height: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-top: var(--space-1) solid
    ${({ $rank }) => metalColors[$rank] ?? 'var(--color-border)'};
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  text-align: left;
  /* Lets the header and the table adapt to the card's own width (three narrow
     cards share a row at 1024px), not the viewport's. */
  container-type: inline-size;
`;

export const Score = styled.div`
  margin-top: var(--space-4);
`;
