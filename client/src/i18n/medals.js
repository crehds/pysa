// The database keeps the medal names in Spanish (backend/seed/data/medallas.json).
// English shows them through this display map; the data itself is not touched.
// A name that is not here (a new medal, say) is shown as it is.
const ENGLISH_MEDAL_NAMES = {
  Heraldo: 'Herald',
  Guardián: 'Guardian',
  Cruzado: 'Crusader',
  Arconte: 'Archon',
  Leyenda: 'Legend',
  Ancient: 'Ancient',
  Divino: 'Divine',
  Inmortal: 'Immortal',
  'Sin Calibrar': 'Uncalibrated',
};

export function medalName(name, language) {
  if (language !== 'en') return name;
  return ENGLISH_MEDAL_NAMES[name] ?? name;
}
