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

**✅ DESIGN VALIDÉ (voie A, v2 — univers « Chats-Sushis », juillet 2026)** : remplace la direction « Nature/aventure » v1. Handoff dans `docs/design-handoff/` : README.md (design tokens + specs par écran), MathKids Maquettes.dc.html (turn 9 = 7 écrans validés, turn 10 = 3 états de l'exercice, turn 8 = personnages SVG ; turns 1-7 = historique à ne pas implémenter), neko-sushi-sprites.svg (personnages prêts à convertir en composants React). Palette reportée dans docs/DESIGN.md §2.

**Prompt pour (re)lancer l'implémentation du design :**
> Le design a changé : univers kawaii « chats-sushis » (v2). Relis docs/DESIGN.md et docs/design-handoff/README.md (référence : turns 9, 10 et 8 du fichier de maquettes ; ignore les turns 1-7). Mets à jour la config Tailwind avec les nouveaux tokens, remplace tout ce qui reste de l'ancien thème nature/aventure, puis : (1) composant `<NekoSushi>` d'après neko-sushi-sprites.svg avec ses variantes et expressions, (2) composants de base (Button relief, Card, pastilles, jauge bol de riz, bouton audio patte), (3) écran de choix du profil, (4) police Baloo 2 via le paquet npm @fontsource/baloo-2 (embarquée au build, zéro requête en ligne). Ce sont des références design, pas du code de production : recrée proprement, et commit quand les tests passent.

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

## Phase 7bis — Choix du niveau + mission découverte

**Objectif** : chaque enfant démarre au bon endroit (voir docs/SPECIFICATIONS.md §5 « Positionnement initial »).

**Prompt :**
> Implémente le positionnement initial décrit dans docs/SPECIFICATIONS.md §5 : (1) le choix du niveau scolaire (CP→CM2) à la création du profil — vérifie qu'aucun profil ne démarre au CP par défaut ; (2) la « mission découverte » optionnelle au premier lancement : le chef propose 8-12 questions adaptatives (réutilise les générateurs et le score de maîtrise du moteur), habillage festif, aucune étoile perdue, refusable, rejouable depuis l'espace parent ; à la fin, pré-remplis les scores de maîtrise, débloque les étapes acquises sur le tapis roulant et ajoute les notions fragiles du niveau précédent aux rappels. Tests unitaires sur l'algorithme de positionnement (moteur pur, sans React).

**Vérification** : créer un profil CE2 → la mission propose des questions CE2 puis descend au CE1 en cas d'erreurs ; refuser la mission → départ à la première étape ; le tapis roulant reflète le résultat.

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
