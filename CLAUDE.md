# CLAUDE.md — MathKids

> Ce fichier est lu automatiquement par Claude Code au démarrage. À placer à la racine du projet.

## Projet

PWA d'apprentissage des mathématiques pour l'école primaire française (CP → CM2), programmes 2025-2026. Utilisateur final : enfants de 6 à 11 ans. Le propriétaire du projet est **débutant en développement** : explique tes choix simplement, une étape à la fois.

Documents de référence (à lire avant toute tâche) :
- `docs/SPECIFICATIONS.md` — contenu pédagogique et fonctionnalités
- `docs/ARCHITECTURE.md` — stack, structure, modèle de données
- `docs/DESIGN.md` — direction visuelle
- `docs/PLAN.md` — phases de développement
- `docs/BENCHMARK.md` — analyse du marché : mécaniques à imiter et travers à éviter

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + Zustand + Dexie.js (IndexedDB) + vite-plugin-pwa + Vitest. Pas de backend : app 100 % statique et offline.

## Commandes

```bash
npm run dev        # serveur de développement
npm run build      # build de production
npm run test       # tests Vitest
npm run lint       # ESLint
```

## Règles d'architecture

1. **Le contenu pédagogique est de la donnée, pas du code** : notions, paliers, gabarits d'exercices et leçons vivent dans `src/content/**/*.json`. Ne jamais coder « en dur » un exercice dans un composant.
2. **`src/engine/` est du TypeScript pur, sans import React** : moteur adaptatif, révision espacée, générateurs. Tout y est testé unitairement.
3. Chaque générateur d'exercice DOIT garantir exactement une bonne réponse et des distracteurs plausibles mais faux. Écrire un test pour chaque gabarit.
4. Composants UI dans `src/components/` (génériques) et `src/features/<domaine>/` (spécifiques).
5. Accès IndexedDB uniquement via `src/db/` (jamais de Dexie direct dans les composants).

## Règles produit (non négociables)

- Public : enfants. Aucune pub, aucun tracking, aucune donnée envoyée en ligne. Tout en local (IndexedDB).
- Erreur de l'enfant = correction bienveillante et explication, jamais de message négatif ni de pénalité visible.
- Textes en français, tutoiement de l'enfant, vocabulaire conforme aux programmes (ex. « droite graduée », « schéma en barres »).
- Pas de schéma en barres au CP (programme 2025). Fractions dès le CE1. Décimaux dès le CM1.
- Cibles tactiles ≥ 48 px, texte ≥ 18 px, consignes audibles (Web Speech API).
- Mode « zen » par défaut (pas de chrono) pour CP-CE1.

## Style de code

- TypeScript strict, pas de `any`.
- Composants fonctionnels + hooks ; nommage en anglais pour le code, en français pour les textes affichés.
- Commits courts et fréquents, messages en français (ex. `feat: générateur additions CP`).
- Après chaque fonctionnalité : lancer `npm run lint && npm run test` avant de conclure.

## Workflow avec le propriétaire

- Avancer phase par phase selon `docs/PLAN.md` ; ne pas sauter d'étapes.
- À la fin de chaque étape, résumer en 3 lignes ce qui a été fait et comment le vérifier dans le