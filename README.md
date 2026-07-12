# MathKids

PWA d'apprentissage des mathématiques pour l'école primaire française (CP → CM2),
programmes 2025-2026. 100 % locale et hors ligne : aucune donnée envoyée en ligne,
aucune pub, aucun tracking.

## Fonctionnalités

- **Multi-profils** (fratrie) avec avatars, chacun sa progression, stockés localement.
- **Choix du niveau** (CP → CM2) et **mission découverte** de positionnement à la création.
- **Moteur adaptatif** : paliers de difficulté, score de maîtrise, révision espacée (Leitner).
- **Exercices générés** (QCM, saisie, vrai/faux, complète-le-trou, comptage, droite graduée,
  horloge, rangement) — variété infinie, chaque exercice a une seule bonne réponse.
- **Leçons** courtes lues à voix haute (Web Speech API), **carte** de progression,
  **récompenses** (étoiles, riz doré, badges) et **boutique** d'avatar.
- **Espace parent** (jauges de maîtrise, temps passé, notions en difficulté, export/import JSON).
- **PWA installable**, fonctionne 100 % hors ligne après la première visite.

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

## Déploiement (Vercel)

L'app est 100 % statique : n'importe quel hébergeur de fichiers statiques convient.
Avec **Vercel** (gratuit, déploiement automatique à chaque `git push`) :

1. Pousser le dépôt sur **GitHub**.
2. Sur [vercel.com](https://vercel.com), *Add New… → Project*, importer le dépôt.
3. Vercel détecte Vite automatiquement — **Build** : `npm run build`, **Output** : `dist`.
4. *Deploy*. Chaque `git push` sur la branche principale redéploie l'app.

Le fichier `vercel.json` gère déjà le repli SPA et le cache des assets.

## Licence

[MIT](LICENSE) — © 2026 Pascal Dao. Réutilisation libre.
Les images/sons éventuels ajoutés devront être libres de droits pour une diffusion publique.

## Documentation

Tous les documents de référence sont dans `docs/` (spécifications, architecture,
design, plan de développement en 8 phases).
