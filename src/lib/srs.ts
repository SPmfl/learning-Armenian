import type { Box, CardState, Rating, VocabCard } from './types';
import { addDays, todayKey } from './progress';

export const INTERVALS_DAYS = [0, 1, 3, 7, 16, 35] as const;

/** Reprograma una tarjeta. `prev` ausente equivale a una tarjeta nueva. */
export function review(prev: CardState | undefined, rating: Rating, now: Date): CardState {
  const box0 = prev?.box ?? 0;
  let box: Box = 0;
  if (rating === 'again') box = 0;
  else if (rating === 'hard') box = Math.max(1, box0) as Box;
  else if (rating === 'good') box = Math.min(box0 + 1, 5) as Box;
  else box = Math.min(box0 + 2, 5) as Box;

  return {
    box,
    due: todayKey(addDays(now, INTERVALS_DAYS[box])),
    lastReview: now.toISOString(),
    lapses: (prev?.lapses ?? 0) + (rating === 'again' && box0 > 0 ? 1 : 0),
    reviews: (prev?.reviews ?? 0) + 1,
  };
}

export function isDue(card: CardState, now: Date): boolean {
  return card.due <= todayKey(now);
}

/**
 * Separa el mazo en tarjetas vencidas (con estado y `due` ya alcanzada) y nuevas (sin estado).
 * El orden del pool —por unidad y lección— se conserva en ambos grupos.
 */
export function buildSession(
  pool: VocabCard[],
  cards: Record<string, CardState>,
  now: Date,
  opts: { limit: number },
): { due: VocabCard[]; fresh: VocabCard[] } {
  const due = pool
    .filter((card) => {
      const state = cards[card.key];
      return state ? isDue(state, now) : false;
    })
    .sort((a, b) => {
      const da = cards[a.key].due;
      const db = cards[b.key].due;
      return da < db ? -1 : da > db ? 1 : 0;
    });

  const fresh = pool.filter((card) => !cards[card.key]);

  if (opts.limit > 0) return { due: due.slice(0, opts.limit), fresh };
  return { due, fresh };
}

/** Cola de una sesión: primero lo vencido, luego lo nuevo, hasta `limit` (0 = sin límite). */
export function sessionQueue(
  pool: VocabCard[],
  cards: Record<string, CardState>,
  now: Date,
  limit: number,
): VocabCard[] {
  const { due, fresh } = buildSession(pool, cards, now, { limit: 0 });
  const queue = [...due, ...fresh];
  return limit > 0 ? queue.slice(0, limit) : queue;
}
