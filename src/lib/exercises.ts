import type { Exercise } from './types';
import { normalizeHy, normalizeLoose } from './text';

export type CheckResult = { correct: boolean; expected: string; got: string };

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/**
 * Respuestas esperadas por tipo:
 * - multiple-choice: índice de la opción elegida
 * - typing / fill-blank: el texto introducido por el usuario
 * - match-pairs: `{ [índiceIzquierda]: índiceDerecha }`
 * - order-words: array de tokens en el orden elegido
 * - flashcard: la calificación (`again` | `hard` | `good` | `easy`); nunca es incorrecta
 */
export function checkExercise(ex: Exercise, response: unknown): CheckResult {
  switch (ex.type) {
    case 'multiple-choice': {
      const index = typeof response === 'number' ? response : Number(asString(response));
      const got = ex.options[index] ?? asString(response);
      return { correct: index === ex.answer, expected: ex.options[ex.answer] ?? '', got };
    }

    case 'typing': {
      const got = asString(response);
      const compare = ex.mode === 'roman' ? normalizeLoose : normalizeHy;
      const correct = ex.answer.some((a) => compare(a) === compare(got));
      return { correct, expected: ex.answer[0] ?? '', got };
    }

    case 'fill-blank': {
      const got = asString(response);
      const correct = ex.answer.some((a) => normalizeHy(a) === normalizeHy(got));
      return { correct, expected: ex.answer[0] ?? '', got };
    }

    case 'match-pairs': {
      const map = (response ?? {}) as Record<string, number>;
      const total = ex.pairs.length;
      const chosen = Object.keys(map);
      const correct = chosen.length === total && ex.pairs.every((_, i) => map[i] === i);
      const got = chosen
        .map((k) => {
          const left = ex.pairs[Number(k)]?.left ?? '';
          const right = ex.pairs[map[k]]?.right ?? '';
          return `${left} ↔ ${right}`;
        })
        .join(', ');
      return { correct, expected: ex.pairs.map((p) => `${p.left} ↔ ${p.right}`).join(', '), got };
    }

    case 'order-words': {
      const arr = Array.isArray(response) ? response.map(asString) : [];
      const correct = normalizeHy(arr.join(' ')) === normalizeHy(ex.answer.join(' '));
      return { correct, expected: ex.answer.join(' '), got: arr.join(' ') };
    }

    case 'flashcard':
      return { correct: true, expected: ex.back, got: asString(response) };
  }
}

/** Índice de la opción correcta, para que el runner pueda reforzar la respuesta elegida. */
export function correctOptionIndex(ex: Exercise): number | null {
  return ex.type === 'multiple-choice' ? ex.answer : null;
}
