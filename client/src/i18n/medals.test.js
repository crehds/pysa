import { medalName } from './medals';

// The database keeps the medal names in Spanish; English only changes what is
// shown.
const NAMES = [
  ['Heraldo', 'Herald'],
  ['Guardián', 'Guardian'],
  ['Cruzado', 'Crusader'],
  ['Arconte', 'Archon'],
  ['Leyenda', 'Legend'],
  ['Ancient', 'Ancient'],
  ['Divino', 'Divine'],
  ['Inmortal', 'Immortal'],
];

describe('medalName', () => {
  test.each(NAMES)('shows %s as %s in English', (spanish, english) => {
    expect(medalName(spanish, 'en')).toBe(english);
  });

  test.each(NAMES)('leaves %s as it is in Spanish', (spanish) => {
    expect(medalName(spanish, 'es')).toBe(spanish);
  });

  test('translates the uncalibrated placeholder', () => {
    expect(medalName('Sin Calibrar', 'en')).toBe('Uncalibrated');
    expect(medalName('Sin Calibrar', 'es')).toBe('Sin Calibrar');
  });

  test('passes a name it does not know through unchanged', () => {
    expect(medalName('Titan', 'en')).toBe('Titan');
    expect(medalName(undefined, 'en')).toBeUndefined();
  });
});
