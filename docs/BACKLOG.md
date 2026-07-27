# Backlog — MathKids

À jour au 27/07/2026. L'app est déployée sur Vercel ; ce fichier liste ce qui reste, par priorité. Claude Code : traiter dans l'ordre, un chantier = un commit.

## ✅ Série d'améliorations (juillet 2026) — TOUT FAIT

Brief `docs/chantiers/AMELIORATIONS-2026-07.md`, traité dans l'ordre `B → C → D → E → A → F → G`, tout fusionné dans `main` :

- **B — Veille écran** (PR #7) : Screen Wake Lock pendant session et Défi calcul ; réglage appareil « Garder l'écran allumé », activé par défaut.
- **C — Pause sans perte** (PR #8) : bouton ✕ discret + confirmation ; à la pause, croquettes/étoiles créditées sur les exercices déjà répondus, sans pénalité.
- **D — Suppression / import de profil** (PR #9) : suppression protégée (double confirmation + export d'abord) ; import JSON non destructif (validation, jamais d'écrasement silencieux).
- **E — Conformité horloge** (PR #11) : la grande aiguille se cale au pas du niveau (30 min CE1, 15 min CE2). Monnaie centimes/virgule et générateurs lire/régler déjà en place.
- **A — Parcours guidé** (PR #12) : carte met en avant une seule « prochaine étape » ; leçon garantie avant la 1re pratique (`lessonsSeen`) ; mode guidé (défaut) supprime la découverte-surprise ; réglage espace parent.
- **F — Mode révision** (PR #14) : bouton « Révision » = séance 100 % rappels (acquises + fragiles, triées par retard/faiblesse) ; détection du retour après ~14 j d'absence + accueil doux.
- **G — Calcul mental ciblé** (PR #15) : choix de la table (ou « au hasard »), suivi fait-par-fait (mini-Leitner par fait, `facts.ts` + `ProfileRecord.factStates`), tableau « mes tables » (vert/orange).

## ✅ Compléments SPEC (juillet 2026) — TOUT FAIT

8. **Schéma en barres visuel** — dessiné comme 1er indice des problèmes additifs (CE1+, jamais au CP) : `BarSchemaView`, moteur `buildBarSchema`.
9. **Rappels inter-niveaux** — les notions fragiles du niveau précédent (mission découverte) remontent réellement en rappel (`reviewNotions` résout tous niveaux).
10. **Accessibilité (SPEC §9)** — espace parent, « Affichage » : police OpenDyslexic embarquée + texte agrandi, persistés par appareil.
11. **Mini-jeu calcul mental (SPEC §7)** — « Défi calcul » depuis la carte : zen par défaut (seul mode CP-CE1), course douce 1 min dès le CE2, banque JSON par niveau.

**Il ne reste plus de chantier ouvert.** Pistes futures : v2 monde Grande Section (SPECIFICATIONS §10), retours de vrais enfants.

## P1 — Retours de test (UX)

1. **Suppression de profil dans l'espace parent** — ✅ FAIT (chantier D, PR #9) : double confirmation nommant l'enfant, export JSON proposé avant, + import JSON non destructif.
2. **Quitter / revenir en arrière pendant un exercice** — ✅ FAIT (chantier C, PR #8) : bouton ✕ discret + confirmation « Tu veux faire une pause ? », sans pénalité, les réponses déjà données comptent (récompenses créditées).

## P2 — Conformité programme (petits chantiers UI)

3. **Horloge interactive** : demi-heures (CE1) et quarts d'heure (CE2) — ✅ FAIT (chantier E, PR #11) : la grande aiguille se cale au pas du niveau (30 / 15 min), lire et régler.
4. **Monnaie avec centimes** (CE2+) — ✅ FAIT : écriture à virgule, pièces centimes (composer/saisir), générateurs `money-convert` / `money-compose` branchés au curriculum.

## P3 — Fond pédagogique

5. **Banque de problèmes rédigés** (type « problem ») — ✅ FAIT : 65 gabarits (`src/content/problems/*.json`) + générateur (tirage sous contraintes, variables dérivées, mini-évaluateur arithmétique maison sans `eval`, substitution `{x}` / `{answer}` / `{x:€}`), indices en 2 temps sans malus, saisie au pavé (MoneyPad si euros), branchement des specs `problem` du curriculum sur la banque.
6. **Saisie décimale au pavé** (virgule) pour les exercices de décimaux en saisie (CM1-CM2) — ✅ FAIT : module `decimal.ts` (valeurs en entiers mis à l'échelle, « 5,9 » = « 5,90 »), générateurs `decimal-add-input` / `decimal-sub-input`, composant `DecimalPad`, branché en CM1 (calcul-decimaux) et CM2 (decimaux-millieme).

## P4 — Confort

7. **Visuels géométriques** — ✅ FAIT : figures planes, solides (emoji), symétrie axiale à compléter (grille interactive), mesures (règle, comparaison de barres, conversion m/cm), repérage sur quadrillage. Toutes les notions du programme sont désormais jouables (100 % de couverture CP→CM2).

## Rappels

- Phase 7bis (choix du niveau + mission découverte) — ✅ FAIT : choix du niveau imposé à la création (jamais CP par défaut) ; mission découverte adaptative (8-12 questions, montée/descente au niveau précédent, `engine/mission.ts`), pré-remplissage de la maîtrise (réussie→acquise, ratée→fragile), rejouable depuis l'espace parent. Limite : rappels du niveau précédent stockés mais dormants (sessions mono-niveau).
- Piste v2 : monde Grande Section (docs/SPECIFICATIONS.md §10).
