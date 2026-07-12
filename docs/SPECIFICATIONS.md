# Spécifications — MathKids (nom provisoire)

Application web progressive (PWA) d'apprentissage des mathématiques pour l'école primaire française (CP → CM2), conforme aux programmes 2025-2026 de l'Éducation nationale. Projet personnel/familial, développé avec Claude Code.

---

## 1. Vision et objectifs

- Permettre à un enfant de 6 à 11 ans de s'entraîner en maths de façon autonome, ludique et motivante.
- Suivre la progression officielle des programmes français (réforme 2025 pour CP-CE1-CE2-CM1, réforme 2026 pour CM2).
- S'adapter au niveau réel de l'enfant : ni trop facile (ennui), ni trop dur (découragement).
- Fonctionner sur ordinateur, tablette et téléphone, y compris hors ligne (PWA).
- Aucune collecte de données personnelles en ligne : tout est stocké localement sur l'appareil (IndexedDB). Pas de compte, pas de serveur — conforme RGPD par conception.

## 2. Utilisateurs

| Profil | Besoins |
|---|---|
| Enfant (6-11 ans) | Interface simple, colorée, lisible ; consignes lues à voix haute (CP-CE1) ; sessions courtes (10-15 min) ; récompenses |
| Parent | Créer les profils enfants, voir la progression par notion, régler le niveau de départ |

Multi-profils sur un même appareil (fratrie) : chaque enfant a son avatar, son niveau, sa progression.

## 3. Contenu pédagogique — progression par niveau

Conforme aux programmes 2025 (cycle 2 + CM1) et 2026 (CM2). Chaque niveau est découpé en **domaines**, chaque domaine en **notions**, chaque notion en **paliers de difficulté** (1 à 5).

### CP
- **Nombres** : nombres jusqu'à 100, lecture/écriture, comparaison, droite graduée, décompositions (dizaines/unités)
- **Calcul** : additions et soustractions jusqu'à 20 puis 100, compléments à 10, doubles et moitiés, calcul mental quotidien
- **Résolution de problèmes** : problèmes additifs/soustractifs en une étape, appui sur la numération et la droite graduée (le schéma en barres n'est pas utilisé au CP — programme 2025)
- **Grandeurs et mesures** : longueurs (comparaison, cm), monnaie (euros), repérage dans le temps (jours, heures entières)
- **Espace et géométrie** : repérage spatial, formes planes (carré, rectangle, triangle, cercle), solides (cube, boule), reproduction sur quadrillage

### CE1
- **Nombres** : jusqu'à 1 000, **premières fractions simples (1/2, 1/4) comme partage** (nouveauté 2025), droite graduée
- **Calcul** : addition/soustraction posées, tables de multiplication de 2 à 5, sens de la multiplication, calcul mental
- **Résolution de problèmes** : problèmes en une ou deux étapes, introduction du schéma en barres
- **Grandeurs et mesures** : longueurs (m, cm), masses (g, kg), monnaie (rendu), heures et demi-heures
- **Espace et géométrie** : angle droit, propriétés carré/rectangle/triangle rectangle, symétrie axiale (approche), déplacements codés

### CE2
- **Nombres** : jusqu'à 10 000, fractions simples (1/2, 1/4, 1/3, 3/4), **écriture à virgule dans le cadre de la monnaie** (nouveauté 2025)
- **Calcul** : multiplication posée (1 chiffre), tables jusqu'à 9, division (sens, partage), calcul mental structuré
- **Résolution de problèmes** : problèmes multiplicatifs, schéma en barres, problèmes à deux étapes
- **Grandeurs et mesures** : périmètre, contenances (L), durées (heures/minutes), monnaie avec centimes
- **Espace et géométrie** : cercle, symétrie axiale, reproduction de figures, cube et pavé droit (patrons simples)

### CM1
- **Nombres** : grands nombres (jusqu'au million), **fractions simples et décimales, nombres décimaux** (descendus du CM2 — nouveauté 2025), comparaison et placement sur droite graduée
- **Calcul** : les 4 opérations posées (division à 1 chiffre au diviseur), calcul avec décimaux (addition/soustraction), multiples et diviseurs, calcul mental
- **Proportionnalité** : **domaine à part entière dès le CM1** (nouveauté) — situations simples, passage par l'unité, échelles et pourcentages d'usage courant (50 %, 25 %, 100 %)
- **Résolution de problèmes** : problèmes à étapes, schéma en barres, problèmes de comparaison
- **Pensée algébrique et informatique** (nouveau domaine) : le signe « = » comme équivalence, égalités à trous, suites et motifs, algorithmes débranché (séquences d'instructions)
- **Probabilités** (nouveau domaine) : vocabulaire (certain, possible, impossible), expériences aléatoires simples
- **Grandeurs et mesures** : aires (comparaison, unités), conversions simples, durées (calculs)
- **Espace et géométrie** : droites perpendiculaires et parallèles, polygones, symétrie, programmes de construction

### CM2 (programme 2026)
- **Nombres** : jusqu'au milliard, fractions (égalités, somme, encadrement), décimaux (jusqu'au millième)
- **Calcul** : division à 2 chiffres au diviseur, multiplication de décimaux, priorités simples, calcul mental expert
- **Proportionnalité** : tableaux de proportionnalité, coefficient, pourcentages, échelles, vitesse (approche)
- **Pensée algébrique et informatique** : raisonner sur des nombres inconnus, équations à trous complexes, algorithmes et boucles (initiation)
- **Probabilités** : quantifier des chances simples (sur 2, sur 4, sur 6 — dés, pièces)
- **Résolution de problèmes** : problèmes complexes multi-étapes, tous types
- **Grandeurs et mesures** : aires (formules carré/rectangle/triangle), volumes (approche), conversions, durées
- **Espace et géométrie** : cercle (rayon/diamètre), triangles particuliers, quadrilatères, symétrie, patrons de solides, plans et coordonnées

## 4. Types d'exercices (moteur générique)

Le contenu est défini en **données** (JSON), pas en code. Un même moteur de rendu affiche tous les exercices. Types nécessaires :

1. **QCM** — 2 à 4 choix, texte ou image
2. **Saisie numérique** — pavé numérique adapté aux enfants
3. **Glisser-déposer** — ranger, classer, placer sur une droite graduée, associer
4. **Vrai/Faux**
5. **Complète le trou** — égalités à trous (ex. 7 + _ = 12)
6. **Manipulation visuelle** — cliquer sur des parts de fraction, compter des objets, lire une horloge interactive
7. **Problème énoncé** — texte (+ audio) avec saisie de la réponse, indice en 2 temps (schéma puis démarche)

La plupart des exercices sont **générés par gabarits** (templates paramétrés) : un gabarit « addition à trou, nombres ≤ N » produit une infinité de variantes. Les problèmes énoncés sont rédigés à la main (banque par notion).

## 5. Moteur adaptatif

Modèle simple et robuste (pas de ML) :

- Chaque notion a 5 paliers de difficulté. L'enfant a un **score de maîtrise** par notion (0-100).
- **Montée** : 4 bonnes réponses consécutives → palier suivant. **Descente** : 2 erreurs consécutives → palier précédent + affichage de la leçon.
- Une notion est **acquise** à maîtrise ≥ 80 avec réussite au palier cible du niveau scolaire.
- **Révision espacée** : les notions acquises reviennent en rappel à J+2, J+7, J+30 (algorithme type Leitner). Une erreur en rappel fait redescendre la maîtrise.
- **Session type (10-15 min)** : 1 notion en cours (60 %), 1 rappel (25 %), 1 découverte ou jeu (15 %).
- Les **prérequis** entre notions forment un graphe : on ne propose pas les décimaux si les fractions simples ne sont pas acquises.

## 6. Leçons interactives

Avant chaque nouvelle notion : une leçon courte (1-3 écrans) avec animation ou manipulation guidée (ex. : découper une tarte pour les fractions, déplacer un curseur sur la droite graduée). Texte court + audio (synthèse vocale du navigateur, Web Speech API). Toujours accessible depuis l'exercice via un bouton « ? Revoir la leçon ».

## 7. Gamification

- **Étoiles** : 1 à 3 étoiles par série d'exercices selon la réussite.
- **Pièces** : gagnées à chaque session, dépensées pour personnaliser son **avatar** (accessoires, fonds).
- **Badges** : par notion acquise, par assiduité (3 jours de suite…), par exploits (10 bonnes réponses d'affilée).
- **Île de progression** : carte visuelle par niveau ; chaque notion est une étape qui se débloque (chemin type « candy map »).
- **Mini-jeux de calcul mental** : course contre la montre douce (pas de chrono anxiogène au CP-CE1 — mode « zen » par défaut, chrono optionnel).
- Jamais de classement entre enfants, jamais de pénalité visible : l'erreur affiche une correction bienveillante et une explication.

## 8. Suivi parent

Écran protégé par un code simple : progression par domaine et notion (jauges de maîtrise), temps passé, notions en difficulté, possibilité d'ajuster le niveau scolaire de l'enfant.

## 9. Exigences non fonctionnelles

- **PWA** : installable, 100 % fonctionnelle hors ligne (service worker, IndexedDB), < 5 Mo au premier chargement hors audio.
- **Accessibilité** : gros boutons tactiles (min 48 px), police lisible (type OpenDyslexic en option), audio des consignes, contrastes AA.
- **Responsive** : mobile portrait, tablette paysage, desktop.
- **Aucune dépendance serveur** : hébergement statique (GitHub Pages, Netlify ou Vercel gratuit).
- **Langue** : français uniquement (v1).

## 10. Hors périmètre (v1)

Comptes en ligne, synchronisation multi-appareils, mode multijoueur, contenu au-delà du CM2, application native (App Store/Play Store).
