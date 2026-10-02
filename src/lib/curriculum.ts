import type { ExerciseStatus, LessonData, ProgressState, UnitData, VocabCard } from './types';
import { deriveLessonStatus } from './progress';

export function orderedUnits(units: UnitData[]): UnitData[] {
  return [...units].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function orderedLessons(lessons: LessonData[], units: UnitData[]): LessonData[] {
  const unitOrder = Object.fromEntries(units.map((u) => [u.id, u.order]));
  return [...lessons].sort(
    (a, b) =>
      (unitOrder[a.unitId] ?? 0) - (unitOrder[b.unitId] ?? 0) ||
      a.order - b.order ||
      a.id.localeCompare(b.id),
  );
}

/** Mazo global de tarjetas: deduplica por forma armenia y conserva la primera aparición. */
export function buildPool(lessons: LessonData[]): VocabCard[] {
  const seen = new Set<string>();
  const pool: VocabCard[] = [];
  for (const lesson of lessons) {
    for (const item of lesson.vocab) {
      if (seen.has(item.hy)) continue;
      seen.add(item.hy);
      pool.push({
        key: item.hy,
        hy: item.hy,
        roman: item.roman,
        es: item.es,
        en: item.en,
        kind: item.kind,
        tags: item.tags,
        lessonId: lesson.id,
        unitId: lesson.unitId,
      });
    }
  }
  return pool;
}

export function unitLessons(unitId: string, lessons: LessonData[]): LessonData[] {
  return lessons.filter((l) => l.unitId === unitId).sort((a, b) => a.order - b.order);
}

export function lessonStatus(lesson: LessonData, progress: ProgressState | null): ExerciseStatus {
  return deriveLessonStatus(progress?.lessons[lesson.id], lesson.exercises.length);
}

/* ------------------------------------------------------------------ *
 * Metadatos compactos: es lo único que viaja al navegador, porque el
 * progreso vive en LocalStorage y las vistas deben pintarse en cliente.
 * ------------------------------------------------------------------ */

export type UnitMeta = { id: string; order: number; lessonIds: string[] };
export type LessonMeta = { id: string; unitId: string; exerciseCount: number };
export type CurriculumMeta = { units: UnitMeta[]; lessons: LessonMeta[] };

export function buildMeta(units: UnitData[], lessons: LessonData[]): CurriculumMeta {
  const sortedUnits = orderedUnits(units);
  const sortedLessons = orderedLessons(lessons, sortedUnits);
  return {
    units: sortedUnits.map((unit) => ({
      id: unit.id,
      order: unit.order,
      lessonIds: sortedLessons.filter((l) => l.unitId === unit.id).map((l) => l.id),
    })),
    lessons: sortedLessons.map((lesson) => ({
      id: lesson.id,
      unitId: lesson.unitId,
      exerciseCount: lesson.exercises.length,
    })),
  };
}

export function completionMap(
  meta: CurriculumMeta,
  progress: ProgressState | null,
): Record<string, ExerciseStatus> {
  const map: Record<string, ExerciseStatus> = {};
  for (const lesson of meta.lessons) {
    map[lesson.id] = deriveLessonStatus(progress?.lessons[lesson.id], lesson.exerciseCount);
  }
  return map;
}

export function unitState(
  meta: CurriculumMeta,
  unitId: string,
  progress: ProgressState | null,
): { done: number; total: number; unlocked: boolean } {
  const map = completionMap(meta, progress);
  const declared = meta.units.find((u) => u.id === unitId);
  const lessonIds =
    declared?.lessonIds ?? meta.lessons.filter((l) => l.unitId === unitId).map((l) => l.id);
  const done = lessonIds.filter((id) => map[id] === 'completed').length;

  const index = meta.units.findIndex((u) => u.id === unitId);
  let unlocked = false;
  if (index === 0) {
    unlocked = true;
  } else if (index > 0) {
    const previous = meta.units[index - 1].lessonIds;
    unlocked = previous.length === 0 || previous.every((id) => map[id] === 'completed');
  }

  return { done, total: lessonIds.length, unlocked };
}

/** Primera lección no completada en orden curricular; `null` si ya está todo hecho. */
export function firstPending(meta: CurriculumMeta, progress: ProgressState | null): string | null {
  const map = completionMap(meta, progress);
  return meta.lessons.find((l) => map[l.id] !== 'completed')?.id ?? null;
}

export function lessonPrerequisites(
  meta: CurriculumMeta,
  unitId: string,
): Array<{ id: string; exerciseCount: number }> {
  const index = meta.units.findIndex((u) => u.id === unitId);
  if (index <= 0) return [];
  const previous = new Set(meta.units[index - 1].lessonIds);
  return meta.lessons
    .filter((l) => previous.has(l.id))
    .map((l) => ({ id: l.id, exerciseCount: l.exerciseCount }));
}

/* ------------------------------------------------------------------ *
 * Vistas ricas (servidor y tests)
 * ------------------------------------------------------------------ */

export function unitProgress(
  unitId: string,
  lessons: LessonData[],
  progress: ProgressState | null,
): { done: number; total: number } {
  const state = unitState(buildMeta([], lessons), unitId, progress);
  return { done: state.done, total: state.total };
}

export function isUnitUnlocked(
  unitId: string,
  units: UnitData[],
  lessons: LessonData[],
  progress: ProgressState | null,
): boolean {
  return unitState(buildMeta(units, lessons), unitId, progress).unlocked;
}

export function nextLesson(currentId: string, ordered: LessonData[]): LessonData | null {
  const index = ordered.findIndex((l) => l.id === currentId);
  return index >= 0 && index + 1 < ordered.length ? ordered[index + 1] : null;
}

export type PoolSource = {
  kind: 'all' | 'unit' | 'tag' | 'starred';
  value?: string;
  starred?: string[];
};

/** Filtra el mazo global según el origen elegido en la página de práctica. */
export function poolFor(pool: VocabCard[], source: PoolSource): VocabCard[] {
  switch (source.kind) {
    case 'unit':
      return pool.filter((c) => c.unitId === source.value);
    case 'tag':
      return pool.filter((c) => c.tags.includes(source.value ?? ''));
    case 'starred': {
      const starred = new Set(source.starred ?? []);
      return pool.filter((c) => starred.has(c.key));
    }
    case 'all':
      return pool;
  }
}
