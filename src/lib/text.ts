/** Puntuación armenia y latina que se ignora al comparar respuestas. */
const PUNCT_RE = /[։՛՜՞՟՝.,!?;:"'`´()[\]{}\u2013\u2014\u2026\u00ab\u00bb\u201c\u201d\u201e\u2018\u2019-]/g;

/**
 * Normaliza texto armenio para compararlo: NFC, ligadura եւ → և, sin puntuación,
 * espacios colapsados. No cambia mayúsculas/minúsculas: en armenio cada letra tiene
 * una sola forma alfabética y las mayúsculas son la misma letra.
 */
export function normalizeHy(s: string): string {
  return s
    .normalize('NFC')
    .replace(/եւ/g, 'և')
    .replace(PUNCT_RE, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Igual que `normalizeHy` pero además en minúsculas; solo para entradas romanizadas. */
export function normalizeLoose(s: string): string {
  return normalizeHy(s).toLowerCase();
}
