# Backlog — MathKids

À jour au 12/07/2026. L'app est déployée sur Vercel ; ce fichier liste ce qui reste, par priorité. Claude Code : traiter dans l'ordre, un chantier = un commit.

## P1 — Retours de test (UX)

1. **Suppression de profil dans l'espace parent** — avec garde-fous : protégée par le code parent, double confirmation explicite (« La progression de Léa sera définitivement effacée »), et proposer l'export JSON de la progression avant suppression.
2. **Quitter / revenir en arrière pendant un exercice** — bouton discret (pour éviter les sorties accidentelles en plein exercice), confirmation adaptée à l'enfant (« Tu veux faire une pause ? Ta progression est gardée ! »), jamais de pénalité à l'abandon : la session reprend ou se clôt proprement, les réponses déjà données comptent.

## P2 — Conformité programme (petits chantiers UI)

3. **Horloge interactive** : demi-heures (CE1) et quarts d'heure (CE2) — l'horloge actuelle ne fait que les heures entières.
4. **Monnaie avec centimes** (CE2+) — écriture à virgule dans le cadre de la monnaie (programme 2025).

## P3 — Fond pédagogique

5. **Banque de problèmes rédigés** (type « problem ») — ✅ FAIT : 65 gabarits (`src/content/problems/*.json`) + générateur (tirage sous contraintes, variables dérivées, mini-évaluateur arithmétique maison sans `eval`, substitution `{x}` / `{answer}` / `{x:€}`), indices en 2 temps sans malus, saisie au pavé (MoneyPad si euros), branchement des specs `problem` du curriculum sur la banque.
6. **Saisie décimale au pavé** (virgule) pour les exercices de décimaux en saisie (CM1-CM2) — EN COURS (prochain).

## P4 — Confort

7. **Visuels géométriques** : symétrie à compléter, coordonnées à placer, tri de figures en glisser-déposer.

## Rappels

- Phase 7bis (mission découverte) : voir docs/PLAN.md — à faire si pas encore fait.
- Piste v2 : monde Grande Section (docs/SPECIFICATIONS.md §10).
