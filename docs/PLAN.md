# Plan de développement — MathKids

8 phases, chacune livrant quelque chose de visible et testable. Pour chaque phase : l'objectif, le prompt à copier-coller dans Claude Code, et comment vérifier. Comptez 1 à 3 sessions de travail par phase.

---

## Phase 0 — Initialisation du projet

**Objectif** : squelette du projet qui s'affiche dans le navigateur.

**Prompt :**
> Lis CLAUDE.md et les documents dans docs/. Initialise le projet : Vite + React 18 + TypeScript + Tailwind + vite-plugin-pwa + Dexie + Zustand + Vitest, avec la structure de dossiers décrite dans docs/ARCHITECTURE.md. Configure ESLint et un dépôt git. Crée une page d'accueil provisoire « MathKids » avec la palette de docs/DESIGN.md. Explique-moi comment lancer le projet.

**Vérification** : `npm run dev` affiche la page d'accueil ; `npm run test` passe.

## Phase 1 — Maquettes design

**Objectif** : valider le design avant de coder (voir docs/DESIGN.md §6).

Une première version existe déjà : `docs/maquettes.html`. Deux options pour itérer : **Claude Design** sur claude.ai (exploration visuelle par conversation, puis transfert à Claude Code — voie A du DESIGN.md §6) ou Claude Code directement avec le prompt ci-dessous.

**✅ PHASE 1 TERMINÉE (voie A)** : design validé — direction « Nature/aventure », 7 écrans + état bonne réponse. Le handoff Claude Design est dans `docs/design-handoff/` (README.md = design tokens et specs par écran ; MathKids Maquettes.dc.html = maquettes de référence, turn 2 = les 7 écrans validés). La palette finale est reportée dans docs/DESIGN.md §2.

**Prompt pour implémenter le design (après Phase 0) :**
> Lis docs/design-handoff/README.md et le turn 2 de docs/design-handoff/MathKids Maquettes.dc.html. Transpose ce design en composants React + config Tailwind (design tokens du README : couleurs, rayons, reliefs, typographie Baloo 2 self-hostée) selon docs/ARCHITECTURE.md. Ce sont des références design, pas du code de production : recrée proprement. Commence par le thème Tailwind et les composants de base (Button, Card, pastilles, jauge), puis l'écran de choix du profil.

**Prompt (voie B) :**
> Améliore docs/maquettes.html (7 écrans cliquables décrits dans docs/DESIGN.md) selon mes retours : [vos retours ici]. Respecte la palette et la typographie du document.

**Vérification** : ouvrir le fichier dans le navigateur, itérer (« la mascotte plus grande », « le fond plus clair »…) jusqu'à satisfaction, montrer aux enfants.

## Phase 2 — Contenu pédagogique CP (pilote)

**Objectif** : le curriculum CP complet en JSON. On valide le format sur un seul niveau avant de faire les autres.

**Prompt :**
> Crée src/content/curriculum/cp.json conformément au modèle de données de docs/ARCHITECTURE.md et au programme CP de docs/SPECIFICATIONS.md : domaines, notions avec prérequis, 5 paliers par notion avec leurs GeneratorSpec. Crée aussi les schémas TypeScript de validation (zod) et un test qui vérifie que le JSON est valide et que le graphe de prérequis n'a pas de cycle.

**Vérification** : `npm run test` passe ; relire le JSON ensemble notion par notion.

## Phase 3 — Moteur : générateurs + adaptatif

**Objectif** : le cœur de l'app, entièrement testé.

**Prompt :**
> Implémente dans src/engine/ : (1) les générateurs d'exercices pour les types QCM, saisie numérique, vrai/faux et complète-le-trou, paramétrés par les GeneratorSpec du CP ; (2) le moteur adaptatif (paliers, score de maîtrise, montée à 4 réussites, descente à 2 erreurs) ; (3) la révision espacée Leitner J+2/J+7/J+30 ; (4) la composition de session 60/25/15. TypeScript pur sans React, avec tests unitaires complets, y compris : chaque exercice généré a exactement une bonne réponse.

**Vérification** : `npm run test` — visez > 30 tests verts sur cette partie.

## Phase 4 — UI exercices + profils

**Objectif** : premier parcours jouable de bout en bout (CP).

**Prompt :**
> Implémente : la création/sélection de profils (features/profile + db Dexie), le rendu des 4 types d'exercices de la phase 3 (features/exercise) fidèle aux maquettes validées, l'orchestration de session (features/session) branchée sur le moteur, le feedback bonne/mauvaise réponse avec correction bienveillante, et la lecture audio des consignes (Web Speech API). Un enfant doit pouvoir faire une session CP complète de 10 minutes.

**Vérification** : faire une vraie session sur téléphone et ordinateur ; fermer et rouvrir → la progression est conservée.

## Phase 5 — Carte, gamification, leçons

**Objectif** : la boucle de motivation complète.

**Prompt :**
> Implémente : la carte de l'île CP (features/map) avec étapes débloquées selon la maîtrise, les étoiles/pièces/badges (features/rewards), la boutique d'avatar, et le système de leçons interactives (features/lesson) avec les leçons CP rédigées d'après docs/SPECIFICATIONS.md §6. Ajoute les types d'exercices glisser-déposer et manipulation visuelle (horloge, droite graduée, parts de fraction).

**Vérification** : parcours enfant complet : leçon → exercices → étoiles → carte qui avance → achat d'un accessoire.

## Phase 6 — Tableau parent + PWA offline

**Objectif** : app installable, offline, avec suivi.

**Prompt :**
> Implémente le tableau de bord parent protégé par code (jauges de maîtrise par domaine, temps passé, notions en difficulté, export/import JSON de la progression) et finalise la PWA : manifest complet, icônes, service worker en precache, bannière d'installation. L'app doit fonctionner 100 % hors ligne après la première visite.

**Vérification** : installer sur un téléphone, passer en mode avion, faire une session complète.

## Phase 7 — Niveaux CE1 → CM2

**Objectif** : tout le primaire. Le moteur existant absorbe le nouveau contenu sans nouveau code (sauf générateurs spécifiques : décimaux, proportionnalité, probabilités, égalités algébriques).

**Prompt (à répéter par niveau) :**
> Crée src/content/curriculum/ce1.json d'après docs/SPECIFICATIONS.md (même méthode que le CP), avec ses leçons et sa banque de problèmes. Ajoute les nouveaux générateurs nécessaires avec leurs tests. Rappels programme : fractions dès le CE1, décimaux et proportionnalité dès le CM1, probabilités et pensée algébrique au cycle 3.

**Vérification** : par niveau, faire relire la progression à un enseignant si possible ; tests verts.

## Phase 8 — Diffusion

**Objectif** : app en ligne, partageable.

**Prompt :**
> Prépare la mise en ligne : build de production optimisé (< 5 Mo), audit Lighthouse (PWA, accessibilité, performance ≥ 90), page d'accueil publique expliquant l'app aux parents, licence, README public. Guide-moi pas à pas pour créer le dépôt GitHub et connecter Vercel pour un déploiement automatique.

**Vérification** : URL publique fonctionnelle, installation PWA testée sur Android et iPhone. Ensuite, si succès : empaquetage Google Play via PWABuilder (voir docs/ARCHITECTURE.md §6).

---

## Conseils de conduite du projet

- Une phase à la fois ; ne laissez pas Claude Code sauter des étapes.
- Commitez après chaque étape validée (`git commit`) : vous pourrez toujours revenir en arrière.
- Testez avec de vrais enfants dès la Phase 4 — c'est le meilleur retour possible.
- Si quelque chose casse : copiez le message d'erreur dans Claude Code et demandez « corrige et explique-moi ce qui s'est passé ».
