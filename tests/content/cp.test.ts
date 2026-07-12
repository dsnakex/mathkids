import cpData from '@/content/curriculum/cp.json'
import { curriculumSchema, type Curriculum } from '@/content/schema'
import { cp } from '@/content/curricula'
import {
  allNotions,
  danglingPrerequisites,
  duplicateNotionIds,
  findPrerequisiteCycle,
} from '@/content/graph'

describe('Curriculum CP', () => {
  it('est conforme au schéma de contenu', () => {
    expect(() => curriculumSchema.parse(cpData)).not.toThrow()
  })

  it('porte l\'identifiant de niveau « cp »', () => {
    expect(cp.id).toBe('cp')
  })

  it('couvre les 5 domaines du programme CP', () => {
    expect(cp.domains.map((d) => d.id)).toEqual([
      'nombres',
      'calcul',
      'problemes',
      'grandeurs-mesures',
      'geometrie',
    ])
  })

  it('donne à chaque notion 5 paliers (niveaux 1 à 5) avec au moins un générateur', () => {
    for (const notion of allNotions(cp)) {
      const levels = notion.tiers.map((t) => t.level).sort((a, b) => a - b)
      expect(levels, `paliers de ${notion.id}`).toEqual([1, 2, 3, 4, 5])
      for (const tier of notion.tiers) {
        expect(tier.generators.length, `générateurs ${notion.id} p${tier.level}`).toBeGreaterThan(0)
      }
    }
  })

  it('ne comporte aucun identifiant de notion en double', () => {
    expect(duplicateNotionIds(cp)).toEqual([])
  })

  it('ne référence que des prérequis existants', () => {
    expect(danglingPrerequisites(cp)).toEqual([])
  })

  it("n'a aucun cycle dans le graphe de prérequis", () => {
    expect(findPrerequisiteCycle(cp)).toBeNull()
  })
})

// Vérifie que les détecteurs du graphe fonctionnent vraiment (sinon les tests
// ci-dessus pourraient passer à tort). On fabrique des curriculums minimaux.
function fakeCurriculum(
  notions: Array<{ id: string; prerequisites: string[] }>,
): Curriculum {
  return {
    id: 'cp',
    name: 'CP',
    domains: [
      {
        id: 'd',
        name: 'D',
        notions: notions.map((n) => ({
          id: n.id,
          name: n.id,
          prerequisites: n.prerequisites,
          lesson: 'l',
          tiers: [],
        })),
      },
    ],
  } as unknown as Curriculum
}

describe('graphe de prérequis (détecteurs)', () => {
  it('détecte un cycle a → b → a', () => {
    const cyclic = fakeCurriculum([
      { id: 'a', prerequisites: ['b'] },
      { id: 'b', prerequisites: ['a'] },
    ])
    expect(findPrerequisiteCycle(cyclic)).not.toBeNull()
  })

  it('détecte un prérequis manquant', () => {
    const broken = fakeCurriculum([{ id: 'a', prerequisites: ['fantome'] }])
    expect(danglingPrerequisites(broken)).toEqual([
      { notion: 'a', missing: 'fantome' },
    ])
  })

  it('ne signale pas de cycle sur un graphe acyclique', () => {
    const dag = fakeCurriculum([
      { id: 'a', prerequisites: [] },
      { id: 'b', prerequisites: ['a'] },
      { id: 'c', prerequisites: ['a', 'b'] },
    ])
    expect(findPrerequisiteCycle(dag)).toBeNull()
  })
})
