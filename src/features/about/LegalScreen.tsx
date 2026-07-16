// Mentions légales et politique de confidentialité (page publique, accessible
// depuis l'écran À propos et le pied de la page d'accueil). Ton sobre, lisible
// par un parent : éditeur, hébergeur, et confidentialité par conception.

import { useAppStore } from '@/app/store'
import { Button } from '@/components/Button'

const CONTACT_EMAIL = 'mathcopain.contact@gmail.com'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="w-full max-w-md rounded-card bg-card p-4 text-left shadow-candy-sm">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="mt-1 flex flex-col gap-2 text-base font-bold text-muted">{children}</div>
    </section>
  )
}

export function LegalScreen() {
  const goAbout = useAppStore((s) => s.goAbout)
  const goProfiles = useAppStore((s) => s.goProfiles)

  return (
    <main className="flex min-h-full flex-col items-center gap-4 bg-cream p-6 font-sans text-ink">
      <h1 className="text-center text-[24px] font-extrabold">
        Mentions légales &amp; confidentialité
      </h1>

      <Section title="Éditeur">
        <p>
          MathKids est éditée par <strong className="text-ink">Pascal D.</strong>
        </p>
        <p>
          Contact :{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>© 2026 Pascal D. — Tous droits réservés.</p>
      </Section>

      <Section title="Hébergeur">
        <p>
          Vercel Inc. — 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis —{' '}
          <span className="text-ink">vercel.com</span>
        </p>
      </Section>

      <Section title="Confidentialité">
        <p>
          <strong className="text-ink">Aucune donnée personnelle n'est collectée ni transmise.</strong>{' '}
          L'application ne dépose aucun cookie et n'embarque aucun traqueur ni outil de mesure
          d'audience.
        </p>
        <p>
          Toutes les données de progression (profils, scores, réglages) restent stockées{' '}
          <strong className="text-ink">localement sur l'appareil</strong> (IndexedDB) et ne quittent
          jamais celui-ci. Il n'existe ni compte en ligne ni serveur applicatif.
        </p>
        <p>
          Ces données peuvent être supprimées à tout moment depuis l'espace parent (suppression du
          profil), ou en effaçant les données du site dans le navigateur.
        </p>
      </Section>

      <div className="mt-1 flex flex-wrap justify-center gap-3 pb-2">
        <Button variant="ghost" onClick={goAbout}>
          ← À propos
        </Button>
        <Button onClick={goProfiles}>Retour à l'accueil</Button>
      </div>
    </main>
  )
}
