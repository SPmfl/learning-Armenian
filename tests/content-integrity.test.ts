import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { ALPHABET, HY_LETTERS, HY_PUNCTUATION } from '../src/data/alphabet';
import { makeLessonSchema } from '../src/lib/schemas';
import { isConsistentRoman } from '../src/lib/translit';
import { normalizeHy } from '../src/lib/text';

const LESSONS_DIR = 'src/content/lessons';
const UNITS_DIR = 'src/content/units';

const LessonSchema = makeLessonSchema(z.string().min(1));

function frontmatter(path: string): unknown {
  const raw = readFileSync(path, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) throw new Error(`Sin frontmatter YAML: ${path}`);
  return parseYaml(match[1]);
}

const lessonFiles = readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.md')).sort();
const unitIds = readdirSync(UNITS_DIR)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => f.replace(/\.yaml$/, ''))
  .sort();

const lessons = lessonFiles.map((file) => ({
  id: file.replace(/\.md$/, ''),
  file,
  data: LessonSchema.parse(frontmatter(join(LESSONS_DIR, file))),
}));

const allExercises = lessons.flatMap((l) => l.data.exercises.map((ex) => ({ ...ex, lessonId: l.id })));
const allVocab = lessons.flatMap((l) => l.data.vocab.map((v) => ({ ...v, lessonId: l.id })));

function lessonsOf(prefix: string) {
  return lessons.filter((l) => l.id.startsWith(prefix));
}

describe('inventario de contenido', () => {
  it('hay 15 lecciones repartidas en 4 unidades', () => {
    expect(lessons).toHaveLength(15);
    expect(unitIds).toEqual(['alfabeto', 'frases', 'pronombres', 'verbos']);
  });

  it('cada lección apunta a una unidad existente y tiene orden positivo', () => {
    for (const lesson of lessons) {
      expect(unitIds, lesson.id).toContain(lesson.data.unit);
      expect(lesson.data.order, lesson.id).toBeGreaterThan(0);
    }
  });

  it('los órdenes de lección son únicos dentro de cada unidad', () => {
    for (const unit of unitIds) {
      const orders = lessonsOf('')
        .filter((l) => l.data.unit === unit)
        .map((l) => l.data.order);
      expect(new Set(orders).size, unit).toBe(orders.length);
    }
  });

  it('cada lección tiene al menos 5 ejercicios y 6 entradas de vocabulario', () => {
    for (const lesson of lessons) {
      expect(lesson.data.exercises.length, `${lesson.id}: ejercicios`).toBeGreaterThanOrEqual(5);
      expect(lesson.data.vocab.length, `${lesson.id}: vocabulario`).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('ejercicios', () => {
  it('los ids son únicos en todo el contenido y en kebab-case', () => {
    const ids = allExercises.map((ex) => ex.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('multiple-choice tiene una respuesta dentro del rango de opciones', () => {
    const mcs = allExercises.filter((ex) => ex.type === 'multiple-choice');
    expect(mcs.length).toBeGreaterThan(0);
    for (const ex of mcs) {
      expect(ex.answer, `${ex.lessonId}:${ex.id}`).toBeLessThan(ex.options.length);
      expect(ex.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(ex.options).size, `${ex.lessonId}:${ex.id} opciones repetidas`).toBe(
        ex.options.length,
      );
    }
  });

  it('order-words es una permutación exacta de sus tokens', () => {
    const ows = allExercises.filter((ex) => ex.type === 'order-words');
    expect(ows.length).toBeGreaterThan(0);
    for (const ex of ows) {
      expect([...ex.answer].sort(), `${ex.lessonId}:${ex.id}`).toEqual([...ex.tokens].sort());
    }
  });

  it('match-pairs tiene al menos 3 pares sin repeticiones en cada columna', () => {
    const mps = allExercises.filter((ex) => ex.type === 'match-pairs');
    expect(mps.length).toBeGreaterThan(0);
    for (const ex of mps) {
      expect(ex.pairs.length, `${ex.lessonId}:${ex.id}`).toBeGreaterThanOrEqual(3);
      const lefts = ex.pairs.map((p) => p.left);
      const rights = ex.pairs.map((p) => p.right);
      expect(new Set(lefts).size, `${ex.lessonId}:${ex.id} izquierda`).toBe(lefts.length);
      expect(new Set(rights).size, `${ex.lessonId}:${ex.id} derecha`).toBe(rights.length);
    }
  });

  it('fill-blank tiene exactamente un hueco', () => {
    for (const ex of allExercises) {
      if (ex.type !== 'fill-blank') continue;
      expect((ex.template.match(/\{\}/g) ?? []).length, `${ex.lessonId}:${ex.id}`).toBe(1);
    }
  });

  it('typing en modo roman no exige caracteres armenios en la respuesta', () => {
    for (const ex of allExercises) {
      if (ex.type !== 'typing' || ex.mode !== 'roman') continue;
      for (const answer of ex.answer) {
        expect(/[\u0531-\u058F]/.test(answer), `${ex.lessonId}:${ex.id}`).toBe(false);
      }
    }
  });
});

describe('vocabulario', () => {
  it('ninguna forma está vacía ni usa la grafía clásica եւ', () => {
    expect(allVocab.length).toBeGreaterThan(100);
    for (const item of allVocab) {
      expect(item.hy.trim().length, item.lessonId).toBeGreaterThan(0);
      expect(item.hy.includes('եւ'), `${item.lessonId}:${item.hy} usa եւ en vez de և`).toBe(false);
      expect(item.roman.trim().length, item.lessonId).toBeGreaterThan(0);
      expect(item.es.trim().length, item.lessonId).toBeGreaterThan(0);
      expect(item.en.trim().length, item.lessonId).toBeGreaterThan(0);
      expect(normalizeHy(item.hy).length, item.lessonId).toBeGreaterThan(0);
    }
  });

  it('la romanización coincide con la derivada de la tabla letra a letra', () => {
    const strict = allVocab.filter((v) => v.kind !== 'phrase' && !v.note);
    expect(strict.length).toBeGreaterThan(80);
    for (const item of strict) {
      expect(isConsistentRoman(item.hy, item.roman), `${item.lessonId}: ${item.hy} → ${item.roman}`).toBe(
        true,
      );
    }
  });

  it('las palabras de alfabeto-05 usan solo caracteres armenios', () => {
    const words = lessonsOf('alfabeto-05')[0].data.vocab.filter((v) => v.kind === 'word');
    expect(words.length).toBeGreaterThanOrEqual(12);
    for (const word of words) expect(/^[\u0531-\u058Fև]+$/.test(word.hy), word.hy).toBe(true);
  });
});

describe('datos del alfabeto', () => {
  it('tiene 39 letras únicas con su mayúscula', () => {
    expect(ALPHABET).toHaveLength(39);
    const lowers = ALPHABET.map((a) => a.lower);
    const uppers = ALPHABET.map((a) => a.upper);
    expect(new Set(lowers).size).toBe(39);
    expect(new Set(uppers).size).toBe(39);
    expect(HY_LETTERS).toHaveLength(38);
    expect(HY_PUNCTUATION).toEqual(['։', '՝', '՞', '՜']);
  });

  it('cada letra tiene nombre, transcripción ISO y transcripción práctica', () => {
    for (const entry of ALPHABET) {
      expect(entry.name.length, entry.lower).toBeGreaterThan(0);
      expect(entry.nameRoman.length, entry.lower).toBeGreaterThan(0);
      expect(entry.iso.length, entry.lower).toBeGreaterThan(0);
      expect(entry.roman.length, entry.lower).toBeGreaterThan(0);
      expect(entry.sound.es.length, entry.lower).toBeGreaterThan(0);
      expect(entry.sound.en.length, entry.lower).toBeGreaterThan(0);
    }
  });

  it('la primera letra y la última son ա y ֆ', () => {
    expect(ALPHABET[0].lower).toBe('ա');
    expect(ALPHABET[ALPHABET.length - 1].lower).toBe('ֆ');
  });
});

describe('coherencia entre el alfabeto y las lecciones', () => {
  it('alfabeto-01 presenta exactamente las vocales', () => {
    expect(lessonsOf('alfabeto-01')[0].data.vocab.map((v) => v.hy).sort()).toEqual(
      ALPHABET.filter((a) => a.group === 'vowel').map((a) => a.lower).sort(),
    );
  });

  it('alfabeto-02 presenta exactamente los sonidos familiares', () => {
    expect(lessonsOf('alfabeto-02')[0].data.vocab.map((v) => v.hy).sort()).toEqual(
      ALPHABET.filter((a) => a.group === 'familiar').map((a) => a.lower).sort(),
    );
  });

  it('alfabeto-03 presenta exactamente los sonidos nuevos', () => {
    expect(lessonsOf('alfabeto-03')[0].data.vocab.map((v) => v.hy).sort()).toEqual(
      ALPHABET.filter((a) => a.group === 'new').map((a) => a.lower).sort(),
    );
  });
});
