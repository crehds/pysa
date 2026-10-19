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
import { useLanguage } from '../../../i18n/LanguageContext';

// Each column: the data key and the dictionary keys of the short text shown and
// of the full word screen readers get (the short text is hidden from them so the
// name is not read twice).
const COLUMNS = [
  { key: 'victories', text: 'stats.wins' },
  { key: 'victoriesDouble', text: 'stats.winsDouble' },
  { key: 'defeats', text: 'stats.losses' },
  { key: 'defeatsDouble', text: 'stats.lossesDouble' },
  { key: 'kills', text: 'stats.kills' },
  { key: 'deaths', text: 'stats.deaths' },
  { key: 'assists', text: 'stats.assists' },
];

// The stats are grouped under two labels so each "D" reads in context: the
// first four columns are results, the last three are the KDA parts.
const GROUPS = [
  { id: 'results', labelKey: 'stats.results', columns: COLUMNS.slice(0, 4) },
  { id: 'kda', labelKey: 'stats.kda', columns: COLUMNS.slice(4) },
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
  const { t } = useLanguage();
  const totals = totalsOf(roles);
  // Without a stored count, the games are the wins plus the defeats (x2 included).
  const games = partidas ?? totals.victories + totals.defeats;
  return (
    <>
      <Table>
        <VisuallyHidden as='caption'>{t('stats.caption', { name })}</VisuallyHidden>
        <colgroup>
          <col />
        </colgroup>
        {GROUPS.map(({ id, columns }) => (
          <colgroup key={id}>
            {columns.map(({ key }) => (
              <col key={key} />
            ))}
          </colgroup>
        ))}
        <thead>
          <tr>
            <ColumnHeader scope='col' rowSpan={2} $role>
              {t('stats.role')}
            </ColumnHeader>
            {GROUPS.map(({ id, labelKey, columns }) => (
              <GroupHeader key={id} scope='colgroup' colSpan={columns.length}>
                {t(labelKey)}
              </GroupHeader>
            ))}
          </tr>
          <tr>
            {COLUMNS.map(({ text }, i) => (
              <ColumnHeader key={i} scope='col'>
                <Abbreviation aria-hidden='true' title={t(text)}>
                  {t(`${text}.short`)}
                </Abbreviation>
                <VisuallyHidden>{t(text)}</VisuallyHidden>
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
            <RowHeader scope='row'>{t('stats.total')}</RowHeader>
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
          <dt>{t('stats.games')}</dt>
          <dd>{games}</dd>
        </div>
        <div>
          <dt>{t('stats.kda')}</dt>
          <dd>{kda}</dd>
        </div>
      </Summary>
    </>
  );
};
