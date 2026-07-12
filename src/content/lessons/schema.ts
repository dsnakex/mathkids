import { z } from 'zod'

// Schéma des leçons interactives (SPECIFICATIONS §6). Une leçon = 1 à 3 « pages »
// courtes (texte + illustration emoji), lues à voix haute. Le contenu est de la
// DONNÉE (JSON), validée au chargement.

export const lessonPageSchema = z.object({
  text: z.string().min(1),
  emoji: z.string().optional(), // illustration simple (placeholder v1)
})

export const lessonSchema = z.object({
  id: z.string().min(1), // ex. « cp.addition-jusqu-20 », référencé par la notion
  title: z.string().min(1),
  pages: z.array(lessonPageSchema).min(1).max(3),
})

export const lessonsFileSchema = z.array(lessonSchema)

export type LessonPage = z.infer<typeof lessonPageSchema>
export type Lesson = z.infer<typeof lessonSchema>
