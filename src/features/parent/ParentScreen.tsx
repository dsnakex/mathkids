// Tableau de bord parent (SPECIFICATIONS §8, handoff écran 7). Accès protégé
// par une porte « adulte » (multiplication). Affiche la maîtrise par domaine, le
// temps passé, les notions en difficulté, et l'export/import JSON de la
// progression. Écran sobre, sans tapis roulant ni confettis.

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useAppStore } from '@/app/store'
import { curriculumFor } from '@/content/curricula'
import { mulberry32 } from '@/engine/generators/rng'
import type { LearnerProgress } from '@/engine/session'
import { loadLearnerProgress } from '@/db/progress'
import { exportProfile, importProfile } from '@/db/backup'
import { Button } from '@/components/Button'
import {
  domainMastery,
  formatDuration,
  generateGateQuestion,
  notionsInDifficulty,
} from './parentModel'
import { parseBackup } from './backup'

// Couleur du pourcentage / de la jauge selon la maîtrise (handoff).
function toneFor(percent: number): { text: string; fill: string } {
  if (percent >= 70) return { text: 'text-success-text', fill: '#4E9A5F' }
  if (percent >= 50) return { text: 'text-prix', fill: '#E9B44C' }
  return { text: 'text-error-text', fill: '#E2A69B' }
}

function DomainGauge({ name, percent }: { name: string; percent: number }) {
  const tone = toneFor(percent)
  return (
    <div>
      <div className="flex justify-between text-base font-extrabold">
        <span className="text-ink">{name}</span>
        <span className={tone.text}>{percent} %</span>
      </div>
      <div className="mt-1 h-4 overflow-hidden rounded-full border border-track-border bg-track">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: tone.fill }} />
      </div>
    </div>
  )
}

// --- Porte d'accès adulte -----------------------------------------------------

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [gate] = useState(() => generateGateQuestion(mulberry32((Date.now() >>> 0) || 1)))
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const goProfiles = useAppStore((s) => s.goProfiles)

  const submit = () => {
    if (Number(value) === gate.answer) onUnlock()
    else {
      setError(true)
      setValue('')
    }
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-5 bg-cream-parent p-6 text-center font-sans text-ink">
      <span aria-hidden="true" className="text-[56px]">🏮</span>
      <h1 className="text-[22px] font-extrabold">Espace parent</h1>
      <p className="text-lg font-bold text-muted">Réponds pour continuer&nbsp;:</p>
      <p className="text-[26px] font-extrabold">{gate.question}</p>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        aria-label="Réponse"
        className="w-40 rounded-card border-[3px] border-hairline bg-card px-4 py-3 text-center text-[24px] font-extrabold text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      />
      {error ? <p className="text-base font-bold text-error-text">Ce n'est pas ça, réessaie.</p> : null}
      <div className="flex flex-col items-center gap-2">
        <Button onClick={submit}>Entrer</Button>
        <Button variant="ghost" onClick={goProfiles}>
          Retour
        </Button>
      </div>
    </main>
  )
}

// --- Tableau de bord ----------------------------------------------------------

function Dashboard() {
  const profiles = useAppStore((s) => s.profiles)
  const storeProfileId = useAppStore((s) => s.profileId)
  const goProfiles = useAppStore((s) => s.goProfiles)
  const refreshProfiles = useAppStore((s) => s.refreshProfiles)

  const [selectedId, setSelectedId] = useState(storeProfileId ?? profiles[0]?.id ?? '')
  const [progress, setProgress] = useState<LearnerProgress>({ mastery: {}, reviews: {} })
  const [message, setMessage] = useState<string | null>(null)

  const profile = profiles.find((p) => p.id === selectedId)

  useEffect(() => {
    if (!selectedId) return
    let alive = true
    loadLearnerProgress(selectedId).then((p) => alive && setProgress(p))
    return () => {
      alive = false
    }
  }, [selectedId, profiles])

  const curriculum = useMemo(() => curriculumFor(profile?.level ?? 'cp'), [profile?.level])
  const domains = useMemo(() => domainMastery(curriculum, progress), [curriculum, progress])
  const difficulties = useMemo(
    () => notionsInDifficulty(curriculum, progress),
    [curriculum, progress],
  )

  const onExport = async () => {
    if (!profile) return
    const backup = await exportProfile(profile.id)
    if (!backup) return
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mathkids-${profile.name}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Progression exportée.')
  }

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permet de ré-importer le même fichier
    if (!file) return
    try {
      const backup = parseBackup(JSON.parse(await file.text()))
      await importProfile(backup)
      await refreshProfiles()
      setSelectedId(backup.profile.id)
      setMessage(`Progression de « ${backup.profile.name} » importée.`)
    } catch {
      setMessage('Fichier invalide : import annulé.')
    }
  }

  return (
    <main className="flex min-h-full flex-col gap-4 bg-cream-parent p-5 font-sans text-ink">
      <header className="flex items-center gap-2">
        <span aria-hidden="true">🏮</span>
        <h1 className="text-[21px] font-extrabold">Espace parent</h1>
      </header>

      {/* Sélecteur de profil (fratrie). */}
      {profiles.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`rounded-full px-3 py-1 text-base font-extrabold ${
                p.id === selectedId ? 'bg-primary text-white' : 'bg-card text-ink shadow-candy-sm'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      ) : null}

      {profile ? (
        <>
          <p className="text-base font-bold text-muted">
            {profile.name} · {profile.sessions ?? 0} séance{(profile.sessions ?? 0) > 1 ? 's' : ''} ·{' '}
            {formatDuration(profile.totalSeconds ?? 0)}
          </p>

          <section className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-candy-sm">
            <h2 className="text-lg font-extrabold">Maîtrise par domaine</h2>
            {domains.map((d) => (
              <DomainGauge key={d.id} name={d.name} percent={d.percent} />
            ))}
          </section>

          <section className="rounded-card border-2 border-error bg-error-soft p-4">
            <h2 className="text-lg font-extrabold text-error-text">Notions à retravailler</h2>
            {difficulties.length === 0 ? (
              <p className="mt-1 text-base font-bold text-muted">
                Rien à signaler — le chef veille 🐾
              </p>
            ) : (
              <ul className="mt-1 list-inside list-disc text-base font-bold text-error-text">
                {difficulties.map((n) => (
                  <li key={n.id}>{n.name}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2 rounded-card bg-card p-4 shadow-candy-sm">
            <h2 className="text-lg font-extrabold">Sauvegarde</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" onClick={onExport}>
                Exporter (JSON)
              </Button>
              <label className="cursor-pointer text-lg font-bold text-muted underline">
                Importer (JSON)
                <input type="file" accept="application/json" onChange={onImport} className="sr-only" />
              </label>
            </div>
            {message ? <p className="text-base font-bold text-success-text">{message}</p> : null}
          </section>
        </>
      ) : (
        <p className="text-base font-bold text-muted">Aucun profil pour l'instant.</p>
      )}

      <div className="mt-auto pt-2">
        <Button variant="ghost" onClick={goProfiles}>
          Retour aux profils
        </Button>
      </div>
    </main>
  )
}

export function ParentScreen() {
  const [unlocked, setUnlocked] = useState(false)
  return unlocked ? <Dashboard /> : <Gate onUnlock={() => setUnlocked(true)} />
}
