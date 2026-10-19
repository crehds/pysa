import styled from 'styled-components';
import { pageGutter } from '../../styles/layout';

export const Box = styled.section`
  ${pageGutter}
  padding-block: var(--space-12);
  text-align: center;
`;

export const Message = styled.p`
  font-size: var(--font-size-lg);
  font-weight: 500;
`;

export const Hint = styled.p`
  margin-top: var(--space-2);
  color: var(--color-text-muted);
`;
