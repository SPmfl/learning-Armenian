import type { CardState, LessonProgress, ProgressState, StorageLike } from './types';

export const STORAGE_KEY = 'hy:progress:v1';
export const THEME_KEY = 'hy:theme';
export const LANG_KEY = 'hy:lang';
export const CHANGE_EVENT = 'hy:progress-changed';

export function todayKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(now: Date, n: number): Date {
  const d = new Date(now.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

export function emptyState(_now: Date): ProgressState {
  return {
    version: 1,
    lessons: {},
    cards: {},
    starred: [],
    stats: {
      streakDays: 0,
      lastActiveDate: null,
      exercisesAnswered: 0,
      exercisesCorrect: 0,
      cardsGraded: 0,
      history: {},
    },
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Acepta solo `version === 1`; cualquier otra cosa produce un estado vacío. */
export function migrate(raw: unknown): ProgressState {
  const base = emptyState(new Date(0));
  if (!isObject(raw) || raw.version !== 1) return base;

  const stats = isObject(raw.stats) ? raw.stats : {};
  const history: Record<string, number> = {};
  if (isObject(stats.history)) {
    for (const [k, v] of Object.entries(stats.history)) {
      if (typeof v === 'number' && Number.isFinite(v)) history[k] = v;
    }
  }

  return {
    version: 1,
    lessons: isObject(raw.lessons) ? (raw.lessons as ProgressState['lessons']) : {},
    cards: isObject(raw.cards) ? (raw.cards as ProgressState['cards']) : {},
    starred: Array.isArray(raw.starred) ? raw.starred.filter((s): s is string => typeof s === 'string') : [],
    stats: {
      streakDays: typeof stats.streakDays === 'number' ? stats.streakDays : 0,
      lastActiveDate: typeof stats.lastActiveDate === 'string' ? stats.lastActiveDate : null,
      exercisesAnswered: typeof stats.exercisesAnswered === 'number' ? stats.exercisesAnswered : 0,
      exercisesCorrect: typeof stats.exercisesCorrect === 'number' ? stats.exercisesCorrect : 0,
      cardsGraded: typeof stats.cardsGraded === 'number' ? stats.cardsGraded : 0,
      history,
    },
  };
}

export function touchActivity(s: ProgressState, now: Date): void {
  const t = todayKey(now);
  if (s.stats.lastActiveDate === t) {
    // ya contabilizado hoy
  } else if (s.stats.lastActiveDate === todayKey(addDays(now, -1))) {
    s.stats.streakDays += 1;
  } else {
    s.stats.streakDays = 1;
  }
  s.stats.history[t] = (s.stats.history[t] ?? 0) + 1;
  s.stats.lastActiveDate = t;
}

export function deriveLessonStatus(lp: LessonProgress | undefined, exerciseCount: number): LessonProgress['status'] {
  if (!lp) return 'not-started';
  if (lp.manualComplete) return 'completed';
  const solved = Object.values(lp.exercises).filter((r) => r.correct >= 1).length;
  if (exerciseCount > 0 && solved >= exerciseCount) return 'completed';
  if (lp.status === 'completed') return 'completed';
  if (solved > 0 || Object.keys(lp.exercises).length > 0) return 'in-progress';
  return 'not-started';
}

export function ensureLesson(s: ProgressState, lessonId: string): LessonProgress {
  const existing = s.lessons[lessonId];
  if (existing) return existing;
  const created: LessonProgress = {
    status: 'not-started',
    completedAt: null,
    manualComplete: false,
    exercises: {},
  };
  s.lessons[lessonId] = created;
  return created;
}

/** Registra un intento de ejercicio y mantiene el estado derivado de la lección. */
export function recordAnswer(
  s: ProgressState,
  lessonId: string,
  exerciseId: string,
  correct: boolean,
  totalExercises: number,
  now: Date,
): void {
  const lp = ensureLesson(s, lessonId);
  const result = lp.exercises[exerciseId] ?? { attempts: 0, correct: 0, lastCorrect: false, lastAt: '' };
  result.attempts += 1;
  if (correct) result.correct += 1;
  result.lastCorrect = correct;
  result.lastAt = now.toISOString();
  lp.exercises[exerciseId] = result;

  lp.status = deriveLessonStatus(lp, totalExercises);
  if (lp.status === 'completed' && !lp.completedAt) lp.completedAt = now.toISOString();

  s.stats.exercisesAnswered += 1;
  if (correct) s.stats.exercisesCorrect += 1;
  touchActivity(s, now);
}

export function recordCardGrade(s: ProgressState, key: string, card: CardState, now: Date): void {
  s.cards[key] = card;
  s.stats.cardsGraded += 1;
  touchActivity(s, now);
}

/** Sesión libre: cuenta la calificación sin reprogramar la tarjeta. */
export function recordFreeGrade(s: ProgressState, now: Date): void {
  s.stats.cardsGraded += 1;
  touchActivity(s, now);
}

function memoryStorage(map: Map<string, string>): StorageLike {
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

function resolveStorage(): StorageLike | undefined {
  try {
    return typeof globalThis !== 'undefined' && 'localStorage' in globalThis
      ? (globalThis as { localStorage?: StorageLike }).localStorage
      : undefined;
  } catch {
    return undefined;
  }
}

function emit(state: ProgressState): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: state }));
  }
}

export type Store = {
  persistent: boolean;
  read(): ProgressState;
  write(state: ProgressState): void;
  update(fn: (state: ProgressState) => void): ProgressState;
  reset(): void;
  export(): string;
  import(json: string): { ok: true } | { ok: false; error: string };
  subscribe(cb: (state: ProgressState) => void): () => void;
};

export function createStore(storage?: StorageLike): Store {
  const memory = new Map<string, string>();
  let backend: StorageLike;
  let persistent = true;

  const provided = storage ?? resolveStorage();
  if (provided) {
    try {
      provided.setItem('hy:probe', '1');
      provided.removeItem('hy:probe');
      backend = provided;
    } catch {
      persistent = false;
      backend = memoryStorage(memory);
    }
  } else {
    persistent = false;
    backend = memoryStorage(memory);
  }

  const store: Store = {
    persistent,
    read() {
      const raw = backend.getItem(STORAGE_KEY);
      if (raw === null) return emptyState(new Date(0));
      try {
        return migrate(JSON.parse(raw));
      } catch {
        return emptyState(new Date(0));
      }
    },
    write(state) {
      try {
        backend.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        persistent = false;
        store.persistent = false;
        memory.set(STORAGE_KEY, JSON.stringify(state));
      }
      emit(state);
    },
    update(fn) {
      const state = store.read();
      fn(state);
      store.write(state);
      return state;
    },
    reset() {
      backend.removeItem(STORAGE_KEY);
      memory.delete(STORAGE_KEY);
      emit(emptyState(new Date(0)));
    },
    export() {
      return JSON.stringify(store.read(), null, 2);
    },
    import(json) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch {
        return { ok: false, error: 'invalid-json' };
      }
      if (!isObject(parsed) || parsed.version !== 1) return { ok: false, error: 'incompatible-version' };
      store.write(migrate(parsed));
      return { ok: true };
    },
    subscribe(cb) {
      if (typeof window === 'undefined') return () => {};
      const handler = (event: Event) => cb((event as CustomEvent<ProgressState>).detail);
      window.addEventListener(CHANGE_EVENT, handler);
      return () => window.removeEventListener(CHANGE_EVENT, handler);
    },
  };

  return store;
}
