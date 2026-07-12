import { CURRICULA } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import { getLesson, LESSONS } from '@/content/lessons'

describe('leçons', () => {
  it('chaque notion (tous niveaux) référence une leçon existante', () => {
    for (const curriculum of Object.values(CURRICULA)) {
      for (const notion of allNotions(curriculum)) {
        const lesson = getLesson(notion.lesson)
        expect(lesson, `leçon manquante pour ${notion.id} (${notion.lesson})`).toBeDefined()
      }
    }
  })

  it('chaque leçon a un titre et au moins une page', () => {
    for (const lesson of LESSONS) {
      expect(lesson.title.length).toBeGreaterThan(0)
      expect(lesson.pages.length).toBeGreaterThan(0)
      for (const page of lesson.pages) expect(page.text.length).toBeGreaterThan(0)
    }
  })

  it('renvoie undefined pour une référence inconnue', () => {
    expect(getLesson('cp.inexistant')).toBeUndefined()
  })
})
