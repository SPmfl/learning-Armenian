import { describe, expect, it } from 'vitest';
import { checkExercise } from '../src/lib/exercises';
import type { Exercise } from '../src/lib/types';

const DUAL = { es: 'x', en: 'x' };

describe('checkExercise', () => {
  it('multiple-choice compara el índice elegido', () => {
    const ex: Exercise = {
      type: 'multiple-choice',
      id: 'e-mc',
      prompt: DUAL,
      options: ['a', 'e', 'o'],
      answer: 1,
    };
    expect(checkExercise(ex, 1)).toEqual({ correct: true, expected: 'e', got: 'e' });
    expect(checkExercise(ex, 2)).toEqual({ correct: false, expected: 'e', got: 'o' });
  });

  it('typing en armenio acepta variantes y tolera puntuación', () => {
    const ex: Exercise = {
      type: 'typing',
      id: 'e-ty',
      prompt: DUAL,
      answer: ['է', 'ե'],
      mode: 'armenian',
    };
    expect(checkExercise(ex, 'է').correct).toBe(true);
    expect(checkExercise(ex, ' ե ').correct).toBe(true);
    expect(checkExercise(ex, 'ի').correct).toBe(false);
  });

  it('typing en modo roman ignora mayúsculas y apóstrofos', () => {
    const ex: Exercise = {
      type: 'typing',
      id: 'e-ty-roman',
      prompt: DUAL,
      answer: ["t'un"],
      mode: 'roman',
    };
    expect(checkExercise(ex, 'TUN').correct).toBe(true);
    expect(checkExercise(ex, 'dun').correct).toBe(false);
  });

  it('typing en armenio no acepta la entrada romanizada', () => {
    const ex: Exercise = {
      type: 'typing',
      id: 'e-ty-strict',
      prompt: DUAL,
      answer: ['տուն'],
      mode: 'armenian',
    };
    expect(checkExercise(ex, 'tun').correct).toBe(false);
  });

  it('fill-blank compara solo el valor del hueco', () => {
    const ex: Exercise = {
      type: 'fill-blank',
      id: 'e-fb',
      prompt: DUAL,
      template: 'Ես ուսանող {}',
      answer: ['եմ'],
    };
    expect(checkExercise(ex, 'եմ').correct).toBe(true);
    expect(checkExercise(ex, 'ես').correct).toBe(false);
  });

  it('match-pairs exige todos los pares correctos', () => {
    const ex: Exercise = {
      type: 'match-pairs',
      id: 'e-mp',
      prompt: DUAL,
      pairs: [
        { left: 'ա', right: 'a' },
        { left: 'բ', right: 'b' },
        { left: 'գ', right: 'g' },
      ],
    };
    expect(checkExercise(ex, { 0: 0, 1: 1, 2: 2 }).correct).toBe(true);
    expect(checkExercise(ex, { 0: 0, 1: 2, 2: 1 }).correct).toBe(false);
    expect(checkExercise(ex, { 0: 0, 1: 1 }).correct).toBe(false);
  });

  it('order-words compara la secuencia completa', () => {
    const ex: Exercise = {
      type: 'order-words',
      id: 'e-ow',
      prompt: DUAL,
      tokens: ['եմ', 'ուսանող', 'Ես'],
      answer: ['Ես', 'ուսանող', 'եմ'],
    };
    expect(checkExercise(ex, ['Ես', 'ուսանող', 'եմ']).correct).toBe(true);
    expect(checkExercise(ex, ['ուսանող', 'Ես', 'եմ']).correct).toBe(false);
  });

  it('flashcard nunca cuenta como error', () => {
    const ex: Exercise = {
      type: 'flashcard',
      id: 'e-fc',
      prompt: DUAL,
      front: 'տուն',
      back: 'casa',
      roman: 'tun',
    };
    expect(checkExercise(ex, 'again')).toEqual({ correct: true, expected: 'casa', got: 'again' });
    expect(checkExercise(ex, 'good').correct).toBe(true);
  });
});
