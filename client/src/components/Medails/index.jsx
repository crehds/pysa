import React from 'react';
import { MedailsDiv, GridDiv } from './styles';
import { useLanguage } from '../../i18n/LanguageContext';

// The medal ranges: [minimum, maximum, name as the database keeps it]. The name
// is shown through the language's display map.
const RANGES = [
  [0, 600, 'Heraldo'],
  [601, 1200, 'Guardián'],
  [1201, 1800, 'Cruzado'],
  [1801, 2400, 'Arconte'],
  [2401, 3000, 'Leyenda'],
  [3001, 3600, 'Ancient'],
  [3601, 4200, 'Divino'],
  [4201, 4800, 'Inmortal'],
];

export const Medails = ({ open = false }) => {
  const { t, medal } = useLanguage();
  return (
    <MedailsDiv id='medails' hidden={!open}>
      <GridDiv>
        <p>{t('ranges.min')}</p>
        <p>{t('ranges.max')}</p>
        <p>{t('ranges.medal')}</p>
      </GridDiv>
      {RANGES.map(([min, max, name]) => (
        <GridDiv key={name}>
          <p>{min}</p>
          <p>{max}</p>
          <p>{medal(name)}</p>
        </GridDiv>
      ))}
    </MedailsDiv>
  );
};
