import styled from 'styled-components';

export const Profile = styled.article`
  border: 1px solid blue;
  width: 300px;
  margin: 5px 10px;
  height: 400px;
  display: inline-block;
  /* flex-direction: row; */
  overflow: hidden;
`;

export const ContentWrapper = styled.div`
  display: grid;
  /* grid-template-columns: 1.2fr 1.2fr 1.2fr 1.2fr 1fr 1fr 1fr; */
  grid-template-rows: 1fr 1.5fr;
  grid-column-gap: 5px;
  text-align: center;
  height: 100%;
`;

export const Score = styled.div`
  display: grid;
  grid-template-rows: 1fr 7fr;
`;
