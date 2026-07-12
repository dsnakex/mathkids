// Leçon interactive avant une nouvelle notion (SPECIFICATIONS §6) : 1 à 3 pages
// courtes, illustrées et lues à voix haute. « J'ai compris ! » lance la session.

import { useState } from 'react'
import { useAppStore } from '@/app/store'
import { cp } from '@/content/curricula'
import { allNotions } from '@/content/graph'
import { getLesson } from '@/content/lessons'
import { AudioButton } from '@/components/AudioButton'
import { Button } from '@/components/Button'
import { NekoSushi } from '@/components/NekoSushi'
import { speak } from '@/utils/speech'

export function LessonScreen() {
  const pendingNotionId = useAppStore((s) => s.pendingNotionId)
  const lessonDone = useAppStore((s) => s.lessonDone)
  const [page, setPage] = useState(0)

  const notion = allNotions(cp).find((n) => n.id === pendingNotionId)
  const lesson = notion ? getLesson(notion.lesson) : undefined

  if (!lesson) {
    // Pas de leçon (ne devrait pas arriver, toutes les notions en ont une).
    return (
      <main className="flex min-h-full flex-col items-center justify-center gap-5 bg-cream p-6 font-sans text-ink">
        <NekoSushi variant="chef" size={96} />
        <Button onClick={lessonDone}>Commencer 🥢</Button>
      </main>
    )
  }

  const current = lesson.pages[page]
  const isLast = page === lesson.pages.length - 1

  return (
    <main className="flex min-h-full flex-col gap-4 bg-cream p-5 font-sans text-ink">
      <header className="flex items-center gap-3">
        <h1 className="text-[20px] font-extrabold">Leçon · {lesson.title}</h1>
        <AudioButton
          label="Écouter la leçon"
          className="ml-auto"
          onClick={() => speak(current.text)}
        />
      </header>

      {/* Carte de contenu. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-card-lg bg-card p-6 text-center shadow-candy">
        {current.emoji ? (
          <span aria-hidden="true" className="text-[72px] leading-none">
            {current.emoji}
          </span>
        ) : null}
        <p className="text-[19px] font-bold leading-relaxed">{current.text}</p>
      </div>

      {/* Pastilles de progression dans la leçon. */}
      {lesson.pages.length > 1 ? (
        <div className="flex justify-center gap-2" aria-hidden="true">
          {lesson.pages.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${i === page ? 'bg-primary' : 'bg-hairline'}`}
            />
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        {page > 0 ? (
          <Button variant="ghost" onClick={() => setPage((p) => p - 1)}>
            ← Retour
          </Button>
        ) : null}
        {isLast ? (
          <Button className="flex-1" onClick={lessonDone}>
            J'ai compris ! 🍣
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => setPage((p) => p + 1)}>
            Suivant →
          </Button>
        )}
      </div>
    </main>
  )
}
