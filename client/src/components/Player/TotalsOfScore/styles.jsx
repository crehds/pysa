import styled from 'styled-components'

export const TotalsWrapper = styled.div`
  display: grid;
  grid-template-columns: 3.5fr 2fr 2fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
`

export const Total = styled.div`
  grid-row: 1 / 3;
  display: flex;
  justify-content:center;
  align-items: center;
`

export const Partidas = styled.div`
  grid-column: 2 / 4;
`

export const KDA =styled.div`
  grid-column: 4/ -1;
`