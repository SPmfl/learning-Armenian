import { ALPHABET, type AlphabetEntry } from '../data/alphabet';
import { normalizeHy, normalizeLoose } from './text';

const BY_LOWER: Record<string, AlphabetEntry> = Object.fromEntries(ALPHABET.map((a) => [a.lower, a]));
const MULTI_CHAR = ALPHABET.filter((a) => a.lower.length > 1)
  .map((a) => a.lower)
  .sort((a, b) => b.length - a.length);

/** Palabras cuya romanización no se deduce letra a letra de la tabla. */
const EXCEPTIONS: Record<string, string> = {
  ով: 'ov',
  ովքեր: "ovk'er",
};

export const HY_TO_ROMAN: Record<string, string> = Object.fromEntries(ALPHABET.map((a) => [a.lower, a.roman]));

export function isArmenian(s: string): boolean {
  return /[\u0531-\u058F]/.test(s);
}

function matchAt(s: string, i: number): { entry: AlphabetEntry; length: number } | null {
  for (const multi of MULTI_CHAR) {
    if (s.startsWith(multi, i)) return { entry: BY_LOWER[multi], length: multi.length };
  }
  const entry = BY_LOWER[s[i]];
  return entry ? { entry, length: 1 } : null;
}

/** Romaniza aplicando la tabla letra a letra, con las reglas de posición inicial de ե, ո y և. */
export function romanize(hy: string): string {
  const s = normalizeHy(hy);
  const exception = EXCEPTIONS[s];
  if (exception) return exception;

  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const match = matchAt(s, i);
    if (!match) {
      out += ch;
      continue;
    }
    const wordStart = i === 0 || s[i - 1] === ' ';
    let roman = match.entry.roman;
    if (match.entry.lower === 'ե') roman = wordStart ? 'ye' : 'e';
    else if (match.entry.lower === 'ո') roman = wordStart ? 'vo' : 'o';
    else if (match.entry.lower === 'և') roman = wordStart ? 'yev' : 'ev';
    out += roman;
    i += match.length - 1;
  }
  return out;
}

/** Comprueba que una romanización escrita a mano coincide con la derivada de la tabla. */
export function isConsistentRoman(hy: string, roman: string): boolean {
  return normalizeLoose(romanize(hy)) === normalizeLoose(roman);
}
