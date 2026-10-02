import { describe, expect, it } from 'vitest';
import { addDays, todayKey } from '../src/lib/progress';
import { buildSession, isDue, review, sessionQueue } from '../src/lib/srs';
import type { CardState, Rating, VocabCard } from '../src/lib/types';

const NOW = new Date(2026, 9, 2, 10, 30, 0);

function cardState(partial: Partial<CardState>): CardState {
  return { box: 0, due: todayKey(NOW), lastReview: null, lapses: 0, reviews: 0, ...partial };
}

function card(hy: string, lessonId = 'alfabeto-01', unitId = 'alfabeto'): VocabCard {
  return { key: hy, hy, roman: 'x', es: 'x', en: 'x', kind: 'word', tags: [], lessonId, unitId };
}

describe('review', () => {
  it('una tarjeta nueva calificada como «bien» sube a la caja 1 y vence mañana', () => {
    const next = review(undefined, 'good', NOW);
    expect(next.box).toBe(1);
    expect(next.due).toBe(todayKey(addDays(NOW, 1)));
    expect(next.reviews).toBe(1);
    expect(next.lapses).toBe(0);
    expect(next.lastReview).toBe(NOW.toISOString());
  });

  it('«otra vez» vuelve a la caja 0 sin contar lapso si la tarjeta era nueva', () => {
    const next = review(cardState({ box: 0, reviews: 1 }), 'again', NOW);
    expect(next.box).toBe(0);
    expect(next.lapses).toBe(0);
    expect(next.due).toBe(todayKey(NOW));
  });

  it('«otra vez» en una tarjeta repasada registra un lapso', () => {
    const next = review(cardState({ box: 2, lapses: 0, reviews: 3 }), 'again', NOW);
    expect(next.box).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.reviews).toBe(4);
  });

  it('«difícil» no promociona y garantiza al menos la caja 1', () => {
    expect(review(cardState({ box: 4 }), 'hard', NOW).box).toBe(4);
    expect(review(cardState({ box: 0 }), 'hard', NOW).box).toBe(1);
  });

  it('«fácil» promociona dos cajas', () => {
    expect(review(cardState({ box: 0 }), 'easy', NOW).box).toBe(2);
    expect(review(cardState({ box: 1 }), 'easy', NOW).box).toBe(3);
  });

  it('la caja 5 es el techo', () => {
    expect(review(cardState({ box: 5 }), 'easy', NOW).box).toBe(5);
    expect(review(cardState({ box: 5 }), 'good', NOW).box).toBe(5);
  });

  it('seis «bien» consecutivos llegan a la caja 5', () => {
    let state: CardState | undefined;
    for (let i = 0; i < 6; i++) state = review(state, 'good', NOW);
    expect(state?.box).toBe(5);
    expect(state?.due).toBe(todayKey(addDays(NOW, 35)));
  });
});

describe('isDue', () => {
  it('vence con la fecha alcanzada, no antes', () => {
    expect(isDue(cardState({ due: todayKey(addDays(NOW, -1)) }), NOW)).toBe(true);
    expect(isDue(cardState({ due: todayKey(NOW) }), NOW)).toBe(true);
    expect(isDue(cardState({ due: todayKey(addDays(NOW, 1)) }), NOW)).toBe(false);
  });
});

describe('buildSession y sessionQueue', () => {
  const pool = [card('ա'), card('բ'), card('գ'), card('դ')];
  const cards: Record<string, CardState> = {
    ա: cardState({ due: todayKey(addDays(NOW, -3)), reviews: 2 }),
    բ: cardState({ due: todayKey(NOW) }),
    գ: cardState({ due: todayKey(addDays(NOW, 5)) }),
  };

  it('separa vencidas de nuevas y descarta las programadas a futuro', () => {
    const { due, fresh } = buildSession(pool, cards, NOW, { limit: 0 });
    expect(due.map((c) => c.key)).toEqual(['ա', 'բ']);
    expect(fresh.map((c) => c.key)).toEqual(['դ']);
  });

  it('ordena las vencidas por fecha ascendente', () => {
    const later = { ...cards, ծ: cardState({ due: todayKey(addDays(NOW, -1)) }) };
    const { due } = buildSession([card('ծ'), ...pool], later, NOW, { limit: 0 });
    expect(due.map((c) => c.key)).toEqual(['ա', 'ծ', 'բ']);
  });

  it('sessionQueue respeta el límite con las vencidas primero', () => {
    expect(sessionQueue(pool, cards, NOW, 2).map((c) => c.key)).toEqual(['ա', 'բ']);
    expect(sessionQueue(pool, cards, NOW, 0).map((c) => c.key)).toEqual(['ա', 'բ', 'դ']);
  });
});

describe('intervalos por caja', () => {
  it('asigna a cada calificación el intervalo de la caja resultante', () => {
    const cases: Array<[Rating, CardState['box'], CardState['box'], number]> = [
      ['again', 2, 0, 0],
      ['hard', 0, 1, 1],
      ['hard', 4, 4, 16],
      ['good', 2, 3, 7],
      ['good', 5, 5, 35],
      ['easy', 0, 2, 3],
      ['easy', 3, 5, 35],
    ];
    for (const [rating, startBox, expectedBox, expectedDays] of cases) {
      const next = review(cardState({ box: startBox }), rating, NOW);
      expect(next.box, `${rating} desde la caja ${startBox}`).toBe(expectedBox);
      expect(next.due, `${rating} desde la caja ${startBox}`).toBe(
        todayKey(addDays(NOW, expectedDays)),
      );
    }
  });
});
