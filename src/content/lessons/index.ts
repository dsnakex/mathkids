// Chargement et validation des leçons CP (fail-fast au chargement du module).

import cpLessons from './cp.json'
import { lessonsFileSchema, type Lesson } from './schema'

const LESSONS: Lesson[] = lessonsFileSchema.parse(cpLessons)

const BY_ID = new Map<string, Lesson>(LESSONS.map((l) => [l.id, l]))

/** Leçon référencée par une notion (`notion.lesson`), ou `undefined` si absente. */
export function getLesson(ref: string): Lesson | undefined {
  return BY_ID.get(ref)
}

export { LESSONS }
export type { Lesson, LessonPage } from './schema'
