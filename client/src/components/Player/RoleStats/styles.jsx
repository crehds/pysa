import styled from 'styled-components';

// Narrow on purpose: eight columns have to fit a phone card, so the cells use
// little padding and the role name wraps instead of widening the table.
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;

  /* Narrow cards: smaller text so the role name does not wrap on every row. */
  @container (max-width: 20rem) {
    font-size: var(--font-size-xs);
  }
`;

export const ColumnHeader = styled.th`
  padding: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 500;
  text-align: ${({ $role }) => ($role ? 'left' : 'right')};
  white-space: nowrap;
`;

// Dotted underline hints that the short letters are abbreviations (the full
// word is in the title and, for screen readers, in the hidden text).
export const Abbreviation = styled.span`
  text-decoration: underline dotted;
  text-underline-offset: var(--space-1);
`;

export const RowHeader = styled.th`
  padding: var(--space-1);
  color: var(--color-text);
  font-weight: 500;
  text-align: left;
  overflow-wrap: anywhere;
`;

export const Cell = styled.td`
  padding: var(--space-1);
  color: var(--color-text);
  text-align: right;
`;

export const TotalCell = styled(Cell)`
  border-top: 1px solid var(--color-border);
  font-weight: 700;
`;

export const Summary = styled.dl`
  display: flex;
  gap: var(--space-6);
  margin: var(--space-3) 0 0;
  padding: 0;
  font-variant-numeric: tabular-nums;

  & dt {
    display: inline;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  & dd {
    display: inline;
    margin: 0 0 0 var(--space-1);
    font-weight: 700;
  }
`;
