import styled from 'styled-components';
import { actionButton } from '../RefreshButton/styles';

export const Message = styled.p`
  font-size: var(--font-size-lg);
  font-weight: 500;
  text-align: center;
`;

export const RetryButton = styled.button`
  ${actionButton}
`;
