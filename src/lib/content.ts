import { getCollection, getEntry } from 'astro:content';
import type { LessonData, UnitData } from './types';

/**
 * Único módulo que toca el módulo virtual `astro:content`. Devuelve datos planos con
 * `unitId` ya resuelto, listos para `src/lib/curriculum.ts` y las páginas.
 */
export async function loadCurriculum(): Promise<{ units: UnitData[]; lessons: LessonData[] }> {
  const unitEntries = await getCollection('units');
  const units: UnitData[] = unitEntries
    .map((entry) => ({ ...entry.data, id: entry.id }))
    .sort((a, b) => a.order - b.order);

  const lessonEntries = await getCollection('lessons', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );

  const lessons: LessonData[] = [];
  for (const entry of lessonEntries) {
    const unit = await getEntry(entry.data.unit);
    if (!unit) throw new Error(`La lección "${entry.id}" apunta a una unidad inexistente`);
    lessons.push({ ...entry.data, id: entry.id, unitId: unit.id });
  }

  return { units, lessons };
}
