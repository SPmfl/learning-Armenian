import type { z } from 'astro/zod';
import type {
  LessonBaseSchema,
  LocalizedSchema,
  UnitSchema,
  VocabItemSchema,
  ExerciseSchema,
} from './schemas';

export type Localized = z.infer<typeof LocalizedSchema>;
export type VocabItem = z.infer<typeof VocabItemSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;

/** Unidad resuelta: `id` viene del nombre de archivo (`units/alfabeto.yaml` → `alfabeto`). */
export type UnitData = z.infer<typeof UnitSchema> & { id: string };

/** Lección con el `reference` de Astro resuelto a un id plano. */
export type LessonData = z.infer<typeof LessonBaseSchema> & { id: string; unitId: string };

/** Tarjeta del mazo de práctica libre / SRS. `key` es la forma armenia canónica. */
export type VocabCard = {
  key: string;
  hy: string;
  roman: string;
  es: string;
  en: string;
  kind: 'letter' | 'word' | 'phrase';
  tags: string[];
  lessonId: string;
  unitId: string;
};

export type Lang = 'es' | 'en';
export type Theme = 'light' | 'dark' | 'auto';
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type ExerciseStatus = 'not-started' | 'in-progress' | 'completed';
export type Box = 0 | 1 | 2 | 3 | 4 | 5;

export type ExerciseResult = {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
};

export type LessonProgress = {
  status: ExerciseStatus;
  completedAt: string | null;
  manualComplete: boolean;
  exercises: Record<string, ExerciseResult>;
};

export type CardState = {
  box: Box;
  due: string; // 'YYYY-MM-DD'
  lastReview: string | null;
  lapses: number;
  reviews: number;
};

export type ProgressStats = {
  streakDays: number;
  lastActiveDate: string | null;
  exercisesAnswered: number;
  exercisesCorrect: number;
  cardsGraded: number;
  history: Record<string, number>;
};

export type ProgressState = {
  version: 1;
  lessons: Record<string, LessonProgress>;
  cards: Record<string, CardState>;
  starred: string[];
  stats: ProgressStats;
};

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
