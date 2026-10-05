import React from 'react';
import {
  Abbreviation,
  Cell,
  ColumnHeader,
  GroupHeader,
  RowHeader,
  Summary,
  Table,
  TotalCell,
} from './styles';
import { VisuallyHidden } from '../../../styles/VisuallyHidden';

// Each column: the short text shown, and the full word screen readers get (the
// short text is hidden from them so the name is not read twice).
const COLUMNS = [
  { short: 'V', full: 'Victorias', key: 'victories' },
  { short: 'V x2', full: 'Victorias dobles', key: 'victoriesDouble' },
  { short: 'D', full: 'Derrotas', key: 'defeats' },
  { short: 'D x2', full: 'Derrotas dobles', key: 'defeatsDouble' },
  { short: 'K', full: 'Asesinatos', key: 'kills' },
  { short: 'D', full: 'Muertes', key: 'deaths' },
  { short: 'A', full: 'Asistencias', key: 'assists' },
];

// The stats are grouped under two labels so each "D" reads in context: the
// first four columns are results, the last three are the KDA parts.
const GROUPS = [
  { label: 'Resultados', columns: COLUMNS.slice(0, 4) },
  { label: 'KDA', columns: COLUMNS.slice(4) },
];

// Totals over every role. The x2 victories and defeats count in the totals.
function totalsOf(roles) {
  const sum = (key) => roles.reduce((total, role) => total + role[key], 0);
  return {
    victories: sum('victories') + sum('victoriesDouble'),
    defeats: sum('defeats') + sum('defeatsDouble'),
    kills: sum('kills'),
    deaths: sum('deaths'),
    assists: sum('assists'),
  };
}

// A player's stats per role, as a table: a hidden caption, one row per role, and
// a totals row in the footer. The games played and the KDA sit below it.
export const RoleStats = ({ name, roles, partidas, kda }) => {
  const totals = totalsOf(roles);
  // Without a stored count, the games are the wins plus the defeats (x2 included).
  const games = partidas ?? totals.victories + totals.defeats;
  return (
    <>
      <Table>
        <VisuallyHidden as='caption'>Estadísticas por rol de {name}</VisuallyHidden>
        <colgroup>
          <col />
        </colgroup>
        {GROUPS.map(({ label, columns }) => (
          <colgroup key={label}>
            {columns.map(({ key }) => (
              <col key={key} />
            ))}
          </colgroup>
        ))}
        <thead>
          <tr>
            <ColumnHeader scope='col' rowSpan={2} $role>
              Rol
            </ColumnHeader>
            {GROUPS.map(({ label, columns }) => (
              <GroupHeader key={label} scope='colgroup' colSpan={columns.length}>
                {label}
              </GroupHeader>
            ))}
          </tr>
          <tr>
            {COLUMNS.map(({ short, full }, i) => (
              <ColumnHeader key={i} scope='col'>
                <Abbreviation aria-hidden='true' title={full}>
                  {short}
                </Abbreviation>
                <VisuallyHidden>{full}</VisuallyHidden>
              </ColumnHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((role, i) => (
            <tr key={i}>
              <RowHeader scope='row'>{role.rol}</RowHeader>
              {COLUMNS.map(({ key }) => (
                <Cell key={key}>{role[key]}</Cell>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <RowHeader scope='row'>Total</RowHeader>
            <TotalCell colSpan={2}>{totals.victories}</TotalCell>
            <TotalCell colSpan={2}>{totals.defeats}</TotalCell>
            <TotalCell>{totals.kills}</TotalCell>
            <TotalCell>{totals.deaths}</TotalCell>
            <TotalCell>{totals.assists}</TotalCell>
          </tr>
        </tfoot>
      </Table>
      <Summary>
        <div>
          <dt>Partidas</dt>
          <dd>{games}</dd>
        </div>
        <div>
          <dt>KDA</dt>
          <dd>{kda}</dd>
        </div>
      </Summary>
    </>
  );
};
