# Benchmark — applications du marché et choix retenus

Analyse des applications de maths les plus utilisées (primaire), ce qu'on leur emprunte et ce qu'on évite volontairement. À placer dans `docs/BENCHMARK.md`.

## 1. Panorama

| Application | Points forts | Limites pour notre cas |
|---|---|---|
| **Duolingo (Math)** | Gamification la plus efficace du marché : leçons courtes, série quotidienne (streak), XP, feedback immédiat, chemin de progression linéaire | Pas aligné sur le programme français ; streaks et ligues jouent sur la peur de perdre (discutable pour des 6-8 ans) |
| **Khan Academy Kids / Khan Academy** | Système de maîtrise par notion (mastery learning) : on n'avance pas tant que ce n'est pas acquis ; gratuit, sans pub ni collecte de données | Contenu américain (Common Core), partiellement traduit ; interface dense pour Khan Academy classique |
| **Prodigy Math** | RPG complet : répondre à des questions de maths pour lancer des sorts — engagement très fort chez les 6-12 ans | Le jeu prend le pas sur l'apprentissage ; pression à l'abonnement payant intégrée au gameplay ; curriculum anglo-saxon |
| **Mathia** (France) | Certifiée Éducation nationale (P2IA), IA adaptative, alignée programmes français, voix pour les non-lecteurs | Réservée surtout aux écoles ; cycle 1-2 principalement |
| **Wiloki** (France) | Couvre tout le programme par niveau avec vidéos + exercices | Abonnement payant ; approche plus « révision » que jeu |
| **Mathador** (Réseau Canopé) | Excellent pour le calcul mental (jeu de type « compte est bon ») | Mono-activité : ne couvre pas le programme |
| **Funexpected Math** | Manipulations interactives remarquables (3-7 ans), primé 2025 | Maternelle/début CP seulement ; anglais |
| **IXL** | Couverture exhaustive, statistiques fines pour parents/profs | Répétitif, peu ludique, scoring punitif critiqué, cher |

## 2. Ce que MathKids emprunte (déjà dans les specs)

- **De Duolingo** : sessions courtes (10-15 min), chemin de progression visuel (notre « île »), feedback immédiat et festif, une notion à la fois, mascotte encourageante.
- **De Khan Academy** : la maîtrise par notion (score 0-100, seuil 80) plutôt que la simple complétion ; graphe de prérequis ; gratuité sans pub ni données.
- **De Prodigy** : l'enrobage narratif et l'avatar personnalisable payé en pièces gagnées — mais dosé pour que le jeu reste au service des maths (ratio session 60/25/15).
- **De Mathia** : alignement strict sur les programmes français et audio des consignes pour les non-lecteurs.
- **De Mathador** : mini-jeux de calcul mental dédiés.
- **De Funexpected** : exercices de manipulation directe (fractions à découper, horloge à régler, droite graduée).

## 3. Ce qu'on évite volontairement

- **Streaks anxiogènes et ligues compétitives** (Duolingo) : pas de compteur qui se « casse », pas de classement — assiduité récompensée positivement (badge « 3 jours de suite ») sans punition en cas d'absence.
- **Le jeu qui cannibalise l'apprentissage** (Prodigy) : les récompenses restent cosmétiques, jamais de boucle de jeu indépendante des exercices.
- **Pression commerciale dans l'expérience enfant** (Prodigy, IXL, Wiloki) : gratuit, rien à acheter en argent réel.
- **Scoring punitif** (IXL : une erreur fait perdre beaucoup de points) : chez nous une erreur déclenche une explication, la descente de palier est silencieuse.
- **Dépendance au réseau et aux comptes** : tout fonctionne offline, sans inscription.

## 4. Différenciateurs de MathKids

1. Alignement complet sur les **programmes français 2025-2026** (rare : la plupart des apps grand public sont anglo-saxonnes).
2. **Gratuit, open source possible, zéro donnée collectée** — argument fort pour les parents et les écoles.
3. **Bienveillance par conception** : gamification positive uniquement, mode zen par défaut CP-CE1.
4. Couverture **CP → CM2 complète** dans une seule app familiale multi-profils.
