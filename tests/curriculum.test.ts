import { describe, expect, it } from 'vitest';
import {
  buildPool,
  isUnitUnlocked,
  nextLesson,
  orderedLessons,
  poolFor,
  unitProgress,
} from '../src/lib/curriculum';
import { emptyState } from '../src/lib/progress';
import type { Exercise, LessonData, ProgressState, UnitData, VocabItem } from '../src/lib/types';

const NOW = new Date(2026, 9, 2);

function vocab(hy: string, roman: string): VocabItem {
  return { hy, roman, es: 'x', en: 'x', kind: 'word', tags: [] };
}

const sampleExercise: Exercise = {
  type: 'multiple-choice',
  id: 'e1',
  prompt: { es: 'x', en: 'x' },
  options: ['a', 'b'],
  answer: 0,
};

function lesson(
  id: string,
  unitId: string,
  order: number,
  items: VocabItem[],
  exercises: Exercise[] = [sampleExercise],
): LessonData {
  return {
    id,
    unitId,
    order,
    title: { es: id, en: id },
    summary: { es: 'x', en: 'x' },
    objectives: [{ es: 'x', en: 'x' }],
    vocab: items,
    exercises,
    draft: false,
  };
}

function unit(id: string, order: number): UnitData {
  return { id, order, title: { es: id, en: id }, description: { es: 'x', en: 'x' }, accent: 'red' };
}

const units = [unit('b', 2), unit('a', 1)];
const lessons = [
  lesson('a-2', 'a', 2, [vocab('դ', 'd')]),
  lesson('a-1', 'a', 1, [vocab('ա', 'a'), vocab('բ', 'b')]),
  lesson('b-1', 'b', 1, [vocab('բ', 'b'), vocab('գ', 'g')]),
];

function completed(id: string, state: ProgressState): ProgressState {
  state.lessons[id] = {
    status: 'completed',
    completedAt: NOW.toISOString(),
    manualComplete: true,
    exercises: {},
  };
  return state;
}

describe('orderedLessons', () => {
  it('ordena por unidad y luego por lección, sin depender del orden de entrada', () => {
    expect(orderedLessons(lessons, units).map((l) => l.id)).toEqual(['a-1', 'a-2', 'b-1']);
  });
});

describe('buildPool', () => {
  it('deduplica por forma armenia y conserva la primera aparición', () => {
    const ordered = orderedLessons(lessons, units);
    const pool = buildPool(ordered);
    expect(pool.map((c) => c.key)).toEqual(['ա', 'բ', 'դ', 'գ']);
    const b = pool.find((c) => c.key === 'բ')!;
    expect(b.lessonId).toBe('a-1');
    expect(b.unitId).toBe('a');
  });

  it('propaga romanización y etiquetas a la tarjeta', () => {
    const pool = buildPool([lesson('x-1', 'x', 1, [{ ...vocab('տուն', 'tun'), tags: ['a', 'b'] }])]);
    expect(pool[0]).toMatchObject({ key: 'տուն', roman: 'tun', tags: ['a', 'b'], kind: 'word' });
  });

  it('devuelve una lista vacía sin lecciones', () => {
    expect(buildPool([])).toEqual([]);
  });
});

describe('nextLesson', () => {
  const ordered = orderedLessons(lessons, units);

  it('avanza a la siguiente lección en orden global', () => {
    expect(nextLesson('a-1', ordered)?.id).toBe('a-2');
    expect(nextLesson('a-2', ordered)?.id).toBe('b-1');
  });

  it('devuelve null en la última lección y con un id desconocido', () => {
    expect(nextLesson('b-1', ordered)).toBeNull();
    expect(nextLesson('nope', ordered)).toBeNull();
  });
});

describe('unitProgress e isUnitUnlocked', () => {
  it('la primera unidad siempre está desbloqueada y la segunda no', () => {
    expect(isUnitUnlocked('a', units, lessons, null)).toBe(true);
    expect(isUnitUnlocked('b', units, lessons, null)).toBe(false);
  });

  it('no hay unidades desbloqueadas si el id no existe', () => {
    expect(isUnitUnlocked('zzz', units, lessons, emptyState(NOW))).toBe(false);
  });

  it('la segunda unidad se abre al completar todas las lecciones de la primera', () => {
    const partial = completed('a-1', emptyState(NOW));
    expect(unitProgress('a', lessons, partial)).toEqual({ done: 1, total: 2 });
    expect(isUnitUnlocked('b', units, lessons, partial)).toBe(false);

    const full = completed('a-2', partial);
    expect(unitProgress('a', lessons, full)).toEqual({ done: 2, total: 2 });
    expect(isUnitUnlocked('b', units, lessons, full)).toBe(true);
  });
});

describe('poolFor', () => {
  const pool = buildPool(orderedLessons(lessons, units));

  it('filtra por unidad según la primera aparición de cada tarjeta', () => {
    // «բ» aparece primero en la unidad a, así que la deduplicación la asigna allí.
    expect(poolFor(pool, { kind: 'unit', value: 'a' }).map((c) => c.key)).toEqual(['ա', 'բ', 'դ']);
    expect(poolFor(pool, { kind: 'unit', value: 'b' }).map((c) => c.key)).toEqual(['գ']);
  });

  it('filtra por etiqueta', () => {
    const tagged = buildPool([lesson('t-1', 't', 1, [{ ...vocab('ժ', 'zh'), tags: ['etiqueta'] }])]);
    expect(poolFor(tagged, { kind: 'tag', value: 'etiqueta' })).toHaveLength(1);
    expect(poolFor(tagged, { kind: 'tag', value: 'otra' })).toHaveLength(0);
  });

  it('filtra por favoritas y devuelve todo con kind "all"', () => {
    expect(poolFor(pool, { kind: 'starred', starred: ['գ'] }).map((c) => c.key)).toEqual(['գ']);
    expect(poolFor(pool, { kind: 'starred', starred: [] })).toHaveLength(0);
    expect(poolFor(pool, { kind: 'all' })).toHaveLength(pool.length);
  });
});
