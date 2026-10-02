import { describe, expect, it } from 'vitest';
import { normalizeHy, normalizeLoose } from '../src/lib/text';

describe('normalizeHy', () => {
  it('equipara la ligadura և con la secuencia եւ', () => {
    expect(normalizeHy('բարեւ')).toBe(normalizeHy('բարև'));
    expect(normalizeHy('բարեւ')).toBe('բարև');
  });

  it('elimina la puntuación armenia y latina', () => {
    expect(normalizeHy('Բարև՛, ինչպե՞ս եք։')).toBe('Բարև ինչպես եք');
    expect(normalizeHy('այո…')).toBe('այո');
  });

  it('colapsa espacios y recorta', () => {
    expect(normalizeHy('  ես   ուսանող  եմ  ')).toBe('ես ուսանող եմ');
    expect(normalizeHy('տուն\n')).toBe('տուն');
  });

  it('normaliza a NFC', () => {
    const decomposed = 'ե\u0587';
    expect(normalizeHy(decomposed).normalize('NFC')).toBe(normalizeHy(decomposed));
  });

  it('conserva las mayúsculas armenias', () => {
    expect(normalizeHy('Հայ')).toBe('Հայ');
    expect(normalizeHy('Հայ')).not.toBe(normalizeHy('հայ'));
  });
});

describe('normalizeLoose', () => {
  it('pasa a minúsculas además de normalizar', () => {
    expect(normalizeLoose('Barev')).toBe('barev');
    expect(normalizeLoose("HAY")).toBe('hay');
    expect(normalizeLoose("t'")).toBe('t');
  });
});
