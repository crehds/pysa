import styled, { css } from 'styled-components';
import { media } from '../../styles/breakpoints';
import { pageGutter } from '../../styles/layout';

const metals = {
  1: 'var(--color-gold)',
  2: 'var(--color-silver)',
  3: 'var(--color-bronze)',
};

export const PodiumSection = styled.section`
  ${pageGutter}
  padding-bottom: var(--space-6);
`;

// DOM order is 1-2-3 (reading order, screen readers). Phones stack it that
// way; from md the full podium is laid out 2-1-3 with CSS only. With fewer than
// three players it keeps the natural order.
export const PodiumList = styled.ol`
  display: grid;
  gap: var(--space-3);
  margin: 0 auto;
  padding: 0;
  list-style: none;

  ${media.md} {
    grid-template-columns: repeat(${({ $count }) => $count}, minmax(0, 1fr));
    align-items: end;
    max-width: calc(${({ $count }) => $count} * var(--podium-card-max-width));

    ${({ $count }) =>
      $count === 3 &&
      css`
        & > li:nth-child(1) {
          order: 2;
        }
        & > li:nth-child(2) {
          order: 1;
        }
        & > li:nth-child(3) {
          order: 3;
        }
      `}
  }
`;

// The metal shows as a top border and the rank badge; the cue that is not
// color is the badge shape, the big numeral and the hidden "oro/plata/bronce".
export const Card = styled.li`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'badge name mmr'
    'badge medal mmr';
  align-items: center;
  column-gap: var(--space-4);
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-top: var(--space-1) solid ${({ $rank }) => metals[$rank]};
  border-radius: var(--radius-md);
  background-color: var(--color-surface);

  /* Phones: a compact row per player. Wide screens: a centered card. */
  ${media.md} {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4);
    text-align: center;
    ${({ $rank }) => $rank === 1 && 'padding-block: var(--space-8);'}
  }
`;

export const Badge = styled.span`
  grid-area: badge;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--radius-full);
  background-color: ${({ $rank }) => metals[$rank]};
  color: var(--color-bg);
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  line-height: 1;
`;

export const Name = styled.p`
  grid-area: name;
  max-width: 100%;
  font-size: var(--font-size-lg);
  font-weight: 700;
  overflow-wrap: anywhere;
`;

export const Medal = styled.p`
  grid-area: medal;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const Mmr = styled.p`
  grid-area: mmr;
  font-variant-numeric: tabular-nums;

  ${media.md} {
    margin-top: var(--space-2);
  }
`;

export const MmrLabel = styled.span`
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const MmrValue = styled.span`
  font-size: var(--font-size-xl);
  font-weight: 700;
`;
