# MathKids

PWA d'apprentissage des mathématiques pour l'école primaire française (CP → CM2),
programmes 2025-2026. 100 % locale et hors ligne : aucune donnée envoyée en ligne,
aucune pub, aucun tracking.

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Zustand · Dexie.js (IndexedDB) ·
vite-plugin-pwa · Vitest.

## Démarrage

```bash
npm install       # à faire une seule fois (installe les dépendances)
npm run dev       # lance le serveur de développement (http://localhost:5173)
```

## Autres commandes

```bash
npm run build     # build de production (dossier dist/)
npm run preview   # prévisualise le build de production
npm run test      # lance les tests Vitest une fois
npm run test:watch# tests en mode surveillance (relance à chaque modification)
npm run lint      # vérifie le code avec ESLint
```

## Structure

Voir `docs/ARCHITECTURE.md`. En bref :

- `src/engine/` — moteur adaptatif et générateurs (TypeScript pur, testé, sans React)
- `src/content/` — contenu pédagogique en JSON (le contenu est de la donnée, pas du code)
- `src/features/` — écrans par domaine (profil, leçon, exercice, session, carte, récompenses, parent)
- `src/components/` — composants UI réutilisables
- `src/db/` — accès IndexedDB via Dexie

## Documentation

Tous les documents de référence sont dans `docs/` (spécifications, architecture,
design, plan de développement en 8 phases).
