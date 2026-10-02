import { describe, expect, it } from 'vitest';
import {
  addDays,
  createStore,
  deriveLessonStatus,
  emptyState,
  migrate,
  recordAnswer,
  todayKey,
  touchActivity,
} from '../src/lib/progress';
import type { LessonProgress, ProgressState, StorageLike } from '../src/lib/types';

const NOW = new Date(2026, 9, 2, 9, 0, 0);

function fakeStorage(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

const brokenStorage: StorageLike = {
  getItem() {
    throw new Error('sin almacenamiento');
  },
  setItem() {
    throw new Error('sin almacenamiento');
  },
  removeItem() {
    throw new Error('sin almacenamiento');
  },
};

describe('fechas', () => {
  it('todayKey usa la fecha local en formato ISO corto', () => {
    expect(todayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('addDays cruza meses y años', () => {
    expect(todayKey(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01');
    expect(todayKey(addDays(new Date(2026, 0, 1), -1))).toBe('2025-12-31');
  });
});

describe('migrate', () => {
  it('rechaza versiones desconocidas o ausentes', () => {
    expect(migrate({ version: 2, lessons: { x: {} } })).toEqual(emptyState(NOW));
    expect(migrate({ lessons: { x: {} } })).toEqual(emptyState(NOW));
    expect(migrate(undefined)).toEqual(emptyState(NOW));
    expect(migrate('nope')).toEqual(emptyState(NOW));
  });

  it('conserva los datos de la versión 1 y repara campos ausentes', () => {
    const migrated = migrate({
      version: 1,
      lessons: { 'alfabeto-01': { status: 'in-progress', completedAt: null, manualComplete: false, exercises: {} } },
      cards: { տուն: { box: 1, due: '2026-10-03', lastReview: null, lapses: 0, reviews: 1 } },
      starred: ['տուն', 7],
      stats: { streakDays: 3, exercisesAnswered: 4 },
    });
    expect(Object.keys(migrated.lessons)).toEqual(['alfabeto-01']);
    expect(migrated.cards['տուն'].box).toBe(1);
    expect(migrated.starred).toEqual(['տուն']);
    expect(migrated.stats.streakDays).toBe(3);
    expect(migrated.stats.exercisesAnswered).toBe(4);
    expect(migrated.stats.history).toEqual({});
    expect(migrated.stats.lastActiveDate).toBeNull();
  });
});

describe('touchActivity', () => {
  it('inicia la racha en 1 la primera vez', () => {
    const s = emptyState(NOW);
    touchActivity(s, NOW);
    expect(s.stats.streakDays).toBe(1);
    expect(s.stats.lastActiveDate).toBe(todayKey(NOW));
    expect(s.stats.history[todayKey(NOW)]).toBe(1);
  });

  it('no cambia la racha si ya hubo actividad hoy', () => {
    const s = emptyState(NOW);
    touchActivity(s, NOW);
    touchActivity(s, NOW);
    expect(s.stats.streakDays).toBe(1);
    expect(s.stats.history[todayKey(NOW)]).toBe(2);
  });

  it('incrementa la racha si la última actividad fue ayer', () => {
    const s = emptyState(NOW);
    touchActivity(s, addDays(NOW, -1));
    touchActivity(s, NOW);
    expect(s.stats.streakDays).toBe(2);
  });

  it('reinicia la racha si se dejó un hueco', () => {
    const s = emptyState(NOW);
    touchActivity(s, addDays(NOW, -5));
    touchActivity(s, NOW);
    expect(s.stats.streakDays).toBe(1);
  });
});

describe('recordAnswer y deriveLessonStatus', () => {
  it('acumula intentos, aciertos y completa la lección', () => {
    const s = emptyState(NOW);
    recordAnswer(s, 'alfabeto-01', 'e1', false, 2, NOW);
    let lp = s.lessons['alfabeto-01'];
    expect(lp.exercises.e1).toMatchObject({ attempts: 1, correct: 0, lastCorrect: false });
    expect(lp.status).toBe('in-progress');
    expect(lp.completedAt).toBeNull();

    recordAnswer(s, 'alfabeto-01', 'e1', true, 2, NOW);
    recordAnswer(s, 'alfabeto-01', 'e2', true, 2, NOW);
    lp = s.lessons['alfabeto-01'];
    expect(lp.exercises.e1).toMatchObject({ attempts: 2, correct: 1, lastCorrect: true });
    expect(lp.status).toBe('completed');
    expect(lp.completedAt).toBe(NOW.toISOString());
    expect(s.stats.exercisesAnswered).toBe(3);
    expect(s.stats.exercisesCorrect).toBe(2);
  });

  it('no borra completedAt en respuestas posteriores', () => {
    const s = emptyState(NOW);
    recordAnswer(s, 'l', 'e1', true, 1, NOW);
    const first = s.lessons.l.completedAt;
    recordAnswer(s, 'l', 'e1', false, 1, addDays(NOW, 1));
    expect(s.lessons.l.completedAt).toBe(first);
    expect(s.lessons.l.status).toBe('completed');
  });

  it('manualComplete gana sobre el recuento de ejercicios', () => {
    const lp: LessonProgress = {
      status: 'in-progress',
      completedAt: null,
      manualComplete: true,
      exercises: {},
    };
    expect(deriveLessonStatus(lp, 5)).toBe('completed');
    expect(deriveLessonStatus(undefined, 5)).toBe('not-started');
    expect(deriveLessonStatus({ ...lp, manualComplete: false }, 5)).toBe('not-started');
  });
});

describe('createStore', () => {
  it('persiste, exporta e importa sin pérdida', () => {
    const storage = fakeStorage();
    const store = createStore(storage);
    expect(store.persistent).toBe(true);

    const state = store.update((s) => {
      recordAnswer(s, 'alfabeto-01', 'e1', true, 1, NOW);
      s.starred.push('տուն');
    });
    const exported = store.export();

    store.reset();
    expect(store.read()).toEqual(emptyState(NOW));

    expect(store.import(exported)).toEqual({ ok: true });
    expect(store.read()).toEqual(state);
  });

  it('rechaza JSON inválido y versiones incompatibles', () => {
    const store = createStore(fakeStorage());
    expect(store.import('{')).toEqual({ ok: false, error: 'invalid-json' });
    expect(store.import(JSON.stringify({ version: 2 }))).toEqual({
      ok: false,
      error: 'incompatible-version',
    });
  });

  it('devuelve un estado vacío ante datos corruptos', () => {
    const storage = fakeStorage();
    storage.map.set('hy:progress:v1', 'no es json');
    expect(createStore(storage).read()).toEqual(emptyState(NOW));
  });

  it('cae a memoria cuando el almacenamiento no está disponible', () => {
    const store = createStore(brokenStorage);
    expect(store.persistent).toBe(false);
    const state = store.update((s) => {
      s.starred.push('x');
    });
    expect(store.read().starred).toEqual(['x']);
    expect(state.starred).toEqual(['x']);
  });

  it('notifica a los suscriptores y permite cancelar la suscripción', () => {
    const seen: ProgressState[] = [];
    const original = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = new EventTarget();
    try {
      const store = createStore(fakeStorage());
      const unsubscribe = store.subscribe((s) => seen.push(s));
      store.update((s) => {
        s.starred.push('ա');
      });
      unsubscribe();
      store.update((s) => {
        s.starred.push('բ');
      });
    } finally {
      (globalThis as { window?: unknown }).window = original;
    }
    expect(seen).toHaveLength(1);
    expect(seen[0].starred).toEqual(['ա']);
  });
});
