import { allProblems } from '@/content/problems'
import { mulberry32 } from '@/engine/generators/rng'
import { drawInstance, renderProblem, generateProblem } from '@/engine/generators/problem'
import { evalConstraint } from '@/engine/generators/expr'
import { generateExercise } from '@/engine/generators'

describe('générateur de problèmes — 200 tirages par gabarit', () => {
  const bank = allProblems()

  it('la banque n\'est pas vide', () => {
    expect(bank.length).toBeGreaterThan(50)
  })

  it('pour CHAQUE problème : réponse entière ≥ 0, contraintes satisfaites, tous les placeholders substitués', () => {
    // On accumule les échecs et on n'asserte qu'une fois (perf : 13000 tirages).
    const failures: string[] = []
    for (const { level, problem } of bank) {
      for (let seed = 0; seed < 200; seed++) {
        const rng = mulberry32(seed * 131 + problem.id.length)
        const scope = drawInstance(problem, rng)
        const ex = renderProblem(problem, scope)
        const label = `${level}/${problem.id}#${seed}`

        if (!Number.isInteger(scope.answer)) failures.push(`réponse non entière ${label}`)
        if (scope.answer < 0) failures.push(`réponse négative ${label}`)
        for (const c of problem.constraints) {
          if (!evalConstraint(c, scope)) failures.push(`contrainte « ${c} » violée ${label}`)
        }
        for (const text of [ex.prompt, ex.explanation, ...ex.hints]) {
          if (text.includes('{')) failures.push(`placeholder résiduel ${label} : « ${text} »`)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('substitue {answer} et le format {x:€} en euros', () => {
    // Problème monétaire : ce2-monnaie-01 (a+b en centimes).
    const found = bank.find((b) => b.problem.answerFormat === 'euros')
    expect(found).toBeDefined()
    const ex = generateProblem(found!.problem, mulberry32(3))
    // L'affichage euros utilise la virgule et le symbole €.
    expect(ex.answerFormat).toBe('euros')
    expect(/\d+,\d{2} €|\d+ €/.test(ex.explanation) || /€/.test(ex.prompt)).toBe(true)
  })
})

describe('schéma en barres (problèmes additifs)', () => {
  const bank = allProblems()

  it('quand un schéma est produit : parts cohérentes, une seule inconnue', () => {
    const failures: string[] = []
    let withSchema = 0
    for (const { level, problem } of bank) {
      for (let seed = 0; seed < 30; seed++) {
        const scope = drawInstance(problem, mulberry32(seed * 17 + problem.id.length))
        const ex = renderProblem(problem, scope, { barModel: true })
        if (!ex.schema) continue
        withSchema++
        const s = ex.schema
        const label = `${level}/${problem.id}#${seed}`
        const labels = [s.totalLabel, ...s.parts.map((p) => p.label)]
        const unknowns = labels.filter((l) => l === '?')
        if (unknowns.length !== 1) failures.push(`inconnue unique attendue ${label}`)
        const sum = s.parts.reduce((a, p) => a + p.value, 0)
        if (sum !== s.total) failures.push(`parts ne somment pas au tout ${label}`)
        // L'inconnue porte bien la réponse.
        const unknownValue = s.totalLabel === '?' ? s.total : s.parts.find((p) => p.label === '?')!.value
        if (unknownValue !== scope.answer) failures.push(`inconnue ≠ réponse ${label}`)
        for (const l of labels) if (l.includes('{')) failures.push(`placeholder résiduel ${label}`)
      }
    }
    expect(failures).toEqual([])
    expect(withSchema).toBeGreaterThan(0) // au moins quelques problèmes additifs en produisent
  })

  it('pas de schéma pour un produit/partage ni sans barModel', () => {
    const mult = bank.find((b) => b.problem.structure === 'multiplication')
    if (mult) {
      const withBar = generateProblem(mult.problem, mulberry32(1), { barModel: true })
      expect(withBar.schema).toBeUndefined()
    }
    const additive = bank.find((b) => ['ajout', 'reunion', 'retrait'].includes(b.problem.structure))
    expect(additive).toBeDefined()
    // Sans barModel (défaut), jamais de schéma — c'est le cas du CP.
    expect(generateProblem(additive!.problem, mulberry32(1)).schema).toBeUndefined()
  })

  it('le CP ne reçoit pas de schéma, un niveau supérieur oui', () => {
    // Un problème additif CP existe (ajout/retrait à une étape).
    const cpProblem = bank.find((b) => b.level === 'cp')
    expect(cpProblem).toBeDefined()
    const cpEx = generateExercise(
      { type: 'problem', params: { level: 'cp', structure: cpProblem!.problem.structure, etapes: 1 } },
      mulberry32(2),
    )
    if (cpEx.type === 'problem') expect(cpEx.schema).toBeUndefined()

    // Au CE1, un problème additif reçoit un schéma.
    let ce1Schema = false
    for (let seed = 0; seed < 40 && !ce1Schema; seed++) {
      const ex = generateExercise(
        { type: 'problem', params: { level: 'ce1', structure: 'ajout', etapes: 1 } },
        mulberry32(seed),
      )
      if (ex.type === 'problem' && ex.schema) ce1Schema = true
    }
    expect(ce1Schema).toBe(true)
  })
})
