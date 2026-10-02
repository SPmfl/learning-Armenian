import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { makeLessonSchema, UnitSchema } from './lib/schemas';

const units = defineCollection({
  loader: glob({ base: './src/content/units', pattern: '*.yaml' }),
  schema: UnitSchema,
});

const lessons = defineCollection({
  loader: glob({ base: './src/content/lessons', pattern: '**/*.{md,mdx}' }),
  schema: makeLessonSchema(reference('units')),
});

export const collections = { units, lessons };
