import { allProblems } from '@/content/problems'
import { mulberry32 } from '@/engine/generators/rng'
import { drawInstance, renderProblem, generateProblem } from '@/engine/generators/problem'
import { evalConstraint } from '@/engine/generators/expr'

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
