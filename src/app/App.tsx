// Page d'accueil provisoire (Phase 0). Elle sert uniquement à vérifier que
// la stack et la palette fonctionnent. Les vrais écrans arrivent en Phase 1.

type LevelChip = { id: string; label: string; className: string }

const LEVELS: LevelChip[] = [
  { id: 'cp', label: 'CP', className: 'bg-cp' },
  { id: 'ce1', label: 'CE1', className: 'bg-ce1' },
  { id: 'ce2', label: 'CE2', className: 'bg-ce2' },
  { id: 'cm1', label: 'CM1', className: 'bg-cm1' },
  { id: 'cm2', label: 'CM2', className: 'bg-cm2' },
]

export default function App() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 bg-sand p-6 text-center font-sans text-ink">
      <span className="text-7xl" role="img" aria-label="Renard mascotte">
        🦊
      </span>

      <h1 className="text-4xl font-extrabold">MathKids</h1>

      <p className="max-w-xs text-lg font-bold text-muted">
        Apprends les maths en t'amusant, du CP au CM2 !
      </p>

      <ul className="flex flex-wrap justify-center gap-3">
        {LEVELS.map((level) => (
          <li key={level.id}>
            <span
              className={`inline-block rounded-full px-4 py-2 text-base font-bold text-white ${level.className}`}
            >
              {level.label}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="min-h-[48px] rounded-btn bg-primary px-8 py-3 text-lg font-extrabold text-white shadow-candy-primary transition-transform active:translate-y-[3px] active:shadow-none"
      >
        Commencer l'aventure
      </button>

      <p className="text-sm font-bold text-muted">
        🚧 Page provisoire — Phase 0
      </p>
    </main>
  )
}
