import styled from 'styled-components';
import { metalColors } from '../../../styles/podium';

export const Header = styled.header`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--space-3);
`;

// A round badge for every rank; ranks 1-3 fill it with the metal (and carry the
// metal's name as hidden text), the others keep it plain.
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  ${({ $rank }) =>
    metalColors[$rank]
      ? `background-color: ${metalColors[$rank]}; color: var(--color-bg);`
      : 'border: 1px solid var(--color-border); color: var(--color-text-muted);'}
`;

export const Avatar = styled.img`
  display: block;
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--radius-md);
  object-fit: cover;
`;

export const Identity = styled.div`
  min-width: 0;
`;

// A heading with data: Ubuntu, never the display font.
export const Name = styled.h2`
  font-family: var(--font-body);
  font-size: var(--font-size-lg);
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;

export const Medal = styled.p`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const Mmr = styled.p`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const MmrLabel = styled.span`
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const MmrValue = styled.span`
  font-size: var(--font-size-xl);
  font-weight: 700;
`;
