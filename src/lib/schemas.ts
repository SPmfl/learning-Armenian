import { z } from 'astro/zod';

export const LocalizedSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
});

export const VocabItemSchema = z.object({
  hy: z.string().min(1), // forma armenia canónica (con և, nunca եւ)
  roman: z.string().min(1), // romanización práctica (tabla de src/data/alphabet.ts)
  es: z.string().min(1),
  en: z.string().min(1),
  kind: z.enum(['letter', 'word', 'phrase']).default('word'),
  tags: z.array(z.string()).default([]),
  note: LocalizedSchema.optional(),
});

export const ExerciseIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id debe ser kebab-case en minúsculas');

export const MultipleChoiceSchema = z.object({
  type: z.literal('multiple-choice'),
  id: ExerciseIdSchema,
  prompt: LocalizedSchema,
  hint: LocalizedSchema.optional(),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().nonnegative(),
  explanation: LocalizedSchema.optional(),
});

export const TypingSchema = z.object({
  type: z.literal('typing'),
  id: ExerciseIdSchema,
  prompt: LocalizedSchema,
  hint: LocalizedSchema.optional(),
  answer: z.array(z.string().min(1)).min(1), // variantes aceptadas
  mode: z.enum(['armenian', 'roman']).default('armenian'),
});

export const FillBlankSchema = z.object({
  type: z.literal('fill-blank'),
  id: ExerciseIdSchema,
  prompt: LocalizedSchema,
  hint: LocalizedSchema.optional(),
  template: z
    .string()
    .min(3)
    .refine((s) => (s.match(/\{\}/g) ?? []).length === 1, {
      message: 'template debe contener exactamente un "{}"',
    }),
  answer: z.array(z.string().min(1)).min(1),
});

export const MatchPairsSchema = z.object({
  type: z.literal('match-pairs'),
  id: ExerciseIdSchema,
  prompt: LocalizedSchema,
  hint: LocalizedSchema.optional(),
  pairs: z.array(z.object({ left: z.string().min(1), right: z.string().min(1) })).min(3),
});

export const OrderWordsSchema = z.object({
  type: z.literal('order-words'),
  id: ExerciseIdSchema,
  prompt: LocalizedSchema,
  hint: LocalizedSchema.optional(),
  tokens: z.array(z.string().min(1)).min(2), // banco, en orden de presentación
  answer: z.array(z.string().min(1)).min(2), // permutación exacta de tokens
});

export const FlashcardSchema = z.object({
  type: z.literal('flashcard'),
  id: ExerciseIdSchema,
  prompt: LocalizedSchema,
  hint: LocalizedSchema.optional(),
  front: z.string().min(1),
  back: z.string().min(1),
  roman: z.string().optional(),
});

export const ExerciseSchema = z.discriminatedUnion('type', [
  MultipleChoiceSchema,
  TypingSchema,
  FillBlankSchema,
  MatchPairsSchema,
  OrderWordsSchema,
  FlashcardSchema,
]);

export const UnitSchema = z.object({
  title: LocalizedSchema,
  description: LocalizedSchema,
  order: z.number().int().positive(),
  accent: z.enum(['red', 'blue', 'orange']).default('red'),
});

/** Todo el frontmatter de lección salvo `unit`, cuyo campo difiere entre Astro y los tests. */
export const LessonBaseSchema = z.object({
  title: LocalizedSchema,
  summary: LocalizedSchema,
  order: z.number().int().positive(),
  objectives: z.array(LocalizedSchema).min(1),
  vocab: z.array(VocabItemSchema).min(1),
  exercises: z.array(ExerciseSchema).min(3),
  draft: z.boolean().default(false),
});

/**
 * Construye el esquema de lección inyectando la estrategia del campo `unit`.
 * `content.config.ts` pasa `reference('units')`; los tests pasan `z.string().min(1)`.
 * Es genérico para que el tipo del campo `unit` se conserve en el esquema resultante.
 */
export function makeLessonSchema<T extends z.ZodType<unknown, unknown>>(unitField: T) {
  return LessonBaseSchema.extend({ unit: unitField });
}
