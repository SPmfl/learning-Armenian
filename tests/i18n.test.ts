import { describe, expect, it } from 'vitest';
import { DEFAULT_LANG, LANGS, t, ui } from '../src/lib/i18n';

describe('diccionario de interfaz', () => {
  it('todos los idiomas declaran exactamente las mismas claves', () => {
    const reference = Object.keys(ui[DEFAULT_LANG]).sort();
    expect(reference.length).toBeGreaterThan(50);
    for (const lang of LANGS) {
      expect(Object.keys(ui[lang]).sort()).toEqual(reference);
    }
  });

  it('no hay cadenas vacías', () => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(ui[lang])) {
        expect(value.length, `${lang}:${key}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('t', () => {
  it('devuelve la cadena del idioma pedido', () => {
    expect(t('nav.lessons', 'es')).toBe('Lecciones');
    expect(t('nav.lessons', 'en')).toBe('Lessons');
  });

  it('interpola argumentos y deja intactos los desconocidos', () => {
    expect(t('exercise.progress', 'es', { n: 2, total: 5 })).toBe('Ejercicio 2 de 5');
    expect(t('exercise.progress', 'en', { n: 1, total: 3 })).toBe('Exercise 1 of 3');
    expect(t('home.streakDays', 'es', { n: 4 })).toBe('4 días seguidos');
  });

  it('devuelve la clave cuando no existe', () => {
    expect(t('no.existe', 'es')).toBe('no.existe');
  });
});
