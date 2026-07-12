# Handoff : MathKids — PWA d'apprentissage des maths (6-11 ans)

## Overview
MathKids est une PWA d'apprentissage des maths pour enfants de 6 à 11 ans (école primaire française, CP → CM2). Univers « île d'aventure » : chaque niveau scolaire est une île, chaque notion une étape d'un chemin qui se débloque. Une mascotte renard 🦊 encourage, explique et fête les réussites. Ce handoff couvre les 7 écrans validés + l'état « bonne réponse » de l'exercice, dans la direction visuelle **Nature / aventure** (validée par le client).

Cible d'implémentation : **React + Tailwind** (souhait explicite du client). Voir aussi `docs/` du projet source (SPECIFICATIONS.md, ARCHITECTURE.md, DESIGN.md).

## About the Design Files
`MathKids Maquettes.dc.html` est une **référence design en HTML** (prototype montrant l'apparence et le comportement voulus), pas du code de production. La tâche est de **recréer ces écrans en React + Tailwind** avec les patterns du codebase cible. Le fichier contient 3 « turns » : turn 3 (état bonne réponse), turn 2 (les 7 écrans validés — c'est la référence principale), turn 1 (exploration de palettes — historique, seule la direction 1c « Nature/aventure » est retenue).

## Fidelity
**High-fidelity** : couleurs, typographie, espacements et états finaux. Recréer fidèlement. Exceptions : la mascotte et les avatars sont des **emoji placeholders** (🦊 🐰 🐸…) à remplacer à terme par des illustrations dédiées ; les icônes d'étapes (➕ ➖ ✖️…) idem.

## Contraintes non négociables
- Contrastes lisibles (AA), texte ≥ 18 px, gros chiffres ≥ 34 px dans les exercices
- Cibles tactiles ≥ 48 px (boutons audio 52 px, réponses ≥ 70 px de haut)
- Erreur toujours **douce** (terracotta rosé, jamais rouge agressif), messages toujours encourageants, jamais négatifs
- Pas de pub, pas de chrono visible, pas de classement
- Tutoiement de l'enfant, très peu de texte, bouton audio (Web Speech API `fr-FR`) pour les non-lecteurs
- Une couleur d'accent par niveau scolaire (l'enfant reconnaît « son île »)

## Design Tokens (direction « Nature / aventure »)

### Couleurs
| Token | Hex | Usage |
|---|---|---|
| `sand` (fond app) | `#F7F1E1` | fond de tous les écrans enfant |
| `sand-dark` (fond parent) | `#F1EAD6` | fond espace parent |
| `card` | `#FDFAF0` | cartes, boutons réponse, bulles |
| `card-alt` | `#FBF6E8` | bulles/pastilles sur la carte de l'île |
| `ink` (texte) | `#2C3A2E` | texte principal |
| `muted` | `#7C755F` | texte secondaire, liens discrets |
| `primary` | `#2E7D5B` | boutons d'action (relief `#1D5940`) |
| `gold` | `#E9B44C` | pièces, badge, étape en cours (texte `#5C3D0C`, relief `#B8842A`) |
| `success` | `#5F9E38` | jauges, bonne réponse (fond `#EDF5E2`, texte `#3E6B24`, relief `#A9C487`) |
| `error` (douce) | `#DA9078` | erreur (fond `#F9E8E0`, texte `#96513A`, relief `#E0BAA8`) |
| `shadow-card` | `#D9CEAE` | relief 3D des cartes/boutons clairs |
| `track` | `#E5DCC3` | fond des jauges |
| `locked` | `#CFC7B0` | étapes verrouillées (icône `#7C755F`) |
| `brown` | `#8F5A22` | prix, accents bruns (tarte : bordure) |

### Accents par niveau (île de l'enfant)
| Niveau | Hex |
|---|---|
| CP | `#5F9E38` |
| CE1 | `#C96F3B` (relief `#8F4B22`) |
| CE2 | `#7D5BA6` |
| CM1 | `#1E8E9E` |
| CM2 | `#B4527A` |

### Dégradés
- Carte de l'île : `linear-gradient(#BCE3DE 0%, #D9E8C4 45%, #F3E5C3 100%)` (lagon → végétation → sable)
- Fin de session : `linear-gradient(#F7F1E1 0%, #F3E5C3 100%)`

### Typographie
- Famille unique : **Baloo 2** (Google Fonts), graisses 500/600/700/800
- Corps : 18-19 px w700 · Consignes : 21 px w800 · Titres : 24-28 px w800
- Grande question : 48 px w800 · Réponses : 34 px w800 · Métadonnées : 16-17 px w700 (minimum absolu)

### Rayons & relief
- Cartes/écrans : 24 px · Boutons : 20-22 px · Petites cartes : 16-18 px · Pastilles : 999 px · Étapes : cercle
- Relief « bonbon » : `box-shadow: 0 5px 0 <couleur foncée>` (4 px pour petits éléments) ; état pressé : `translateY(3px)` + shadow 2 px

## Screens / Views (turn 2 du fichier, cartes 390×760)

### 1. Choix du profil
Fond `sand`, contenu centré verticalement. Mascotte 64 px, titre « Qui joue aujourd'hui ? » 28 px. Grille flex wrap de cartes profil 132 px de large (fond `card`, radius 24, relief `#D9CEAE`) : avatar emoji 52 px, prénom 19 px w800, chip niveau (pastille 999 px, fond = accent du niveau, texte blanc 16 px). Bouton « + » : bordure 3 px dashed `#BCB194`, texte `muted`, 44 px, même gabarit. En bas : lien discret « 🔒 Espace parent » (souligné, `muted`, 18 px, padding 12 px).

### 2. Carte de l'île (CE1)
Fond dégradé lagon→sable. Topbar : pastille « 🏝️ Île du CE1 » (fond accent CE1, blanc, 18 px), pastilles 🪙 145 (gold) et ⭐ 23 (card-alt). Chemin : conteneur `relative`, étapes positionnées en zigzag (absolues), reliées par segments pointillés `5px dotted rgba(92,61,12,.4)` rotés. Étapes 78 px (88 px pour l'étape en cours) :
- **Faite** : fond accent niveau, icône blanche 30 px, bordure 4 px `card-alt`, relief foncé ; étoiles gagnées (1-3 ⭐) sous le cercle
- **En cours** : fond `gold`, animation pulse `scale(1→1.09)` 1.6 s infinite
- **Verrouillée** : fond `locked`, icône 🔒
En bas : mascotte 56 px + bulle de dialogue (fond `card-alt`, radius `18 18 18 4`, 18 px w700, max-width 230 px).

### 3. Leçon interactive (les moitiés)
Fond `sand`, padding 20. Header : « Leçon · Les moitiés » 20 px + bouton audio rond 52 px (primary, relief). Zone d'animation : carte `card` flex-1, liseré intérieur `inset 0 0 0 3px #E5DCC3` — tarte 180 px : `conic-gradient(#E9B44C 0 50%, #F9EDD2 50% 100%)`, bordure 6 px `#8F5A22`, trait de coupe vertical 4 px ; texte explicatif 19 px centré. Puis mascotte 44 px + bulle (radius `4 18 18 18`). Bouton pleine largeur « J'ai compris ! » (primary, 21 px, relief).

### 4. Exercice (état neutre / erreur)
Fond `sand`, padding 20, gap 16. Header : mascotte 26 px + jauge de session (16 px de haut, fond `track`, remplissage `success`, radius 999) + « 4/9 » 18 px. Consigne : bouton audio 52 px + « Quelle est la moitié de 8 ? » 21 px. Grande carte question « 8 ÷ 2 = ? » 48 px centrée (fond `card`, radius 24). Grille 2×2 de réponses (gap 14) : boutons `card`, 34 px w800, radius 22, relief `#D9CEAE`, bordure 3 px transparente. **État erreur** (réponse « 6 » choisie) : bordure `error`, fond `#F9E8E0`, relief `#E0BAA8` ; carte feedback en dessous (fond `#F9E8E0`, bordure 3 px `error`) : mascotte 34 px + « Presque ! La moitié de 8, c'est 4 : regarde, 4 + 4 = 8 😊 » 18 px `#96513A`. Jamais de croix rouge ni de « Faux ! ». Bouton « Continuer » collé en bas (`margin-top:auto`).

### 4bis. Exercice — état bonne réponse (turn 3 du fichier)
Réponse « 4 ✓ » : bordure `success` 3 px, fond `#EDF5E2`, relief `#A9C487`. Autres réponses : `opacity:.55`. La grande question complète le résultat : « 8 ÷ 2 = **4** » (4 en `#3E6B24`). Feedback : fond `#EDF5E2`, bordure `success`, « Bravo Léa ! 4 + 4 = 8, tu as trouvé la moitié ! » + mascotte 🦊🎉. Jauge passe à 5/9. **Confettis** : ~12 pièces 9-12 px (carrés radius 3 et ronds, couleurs des 5 accents niveaux + gold), calque absolu `pointer-events:none` ; chute `translateY(0→820px) rotate(0→360deg)` linéaire infinie, durées 2.6-3.8 s, délais négatifs échelonnés. Son joyeux court (désactivable).

### 5. Fin de session
Fond dégradé sable, centré. Mascotte 🦊🎉 64 px, titre « Super séance, Léa ! » 28 px, 3 étoiles 64 px, carte gain « 🪙 +12 pièces » (card, 20 px), carte badge « 🏅 Nouveau badge “Reine des moitiés” » (fond `gold`, texte `#5C3D0C`, relief `#B8842A`). Bouton pleine largeur « Dépenser mes pièces » (primary) + lien discret « Retour à l'île ». Ton festif, aucun score comparatif.

### 6. Boutique d'avatar
Fond `sand`. Header : « La boutique » 24 px + solde 🪙 157 (pastille gold, 18 px). Carte aperçu : avatar 60 px + prénom 20 px + « porte : 🎀 + 🕶️ » 16 px `muted`. Sections « Accessoires » et « Fonds d'écran » (titres 18 px) : grilles 3 colonnes (gap 12) d'articles (fond `card`, radius 18, relief) — emoji 32 px + prix « 🪙 50 » 16 px `#8F5A22` ; possédé : bordure 3 px `success` + « Possédé ✔ » `#3E6B24`. Bouton « Retour à l'île » en bas. Achat uniquement en pièces gagnées — **aucun achat réel, aucune pub**.

### 7. Tableau de bord parent
Fond `sand-dark` (plus sobre). Titre « 👨‍👩‍👧 Espace parent — Léa (CE1) » 21 px, sous-titre « Cette semaine : 4 sessions · 52 minutes » 16 px `muted`. 4 cartes de maîtrise (Nombres 82 %, Calcul 61 %, Problèmes 38 %, Grandeurs et mesures 74 %) : nom + pourcentage (coloré : ≥70 % `#3E6B24`, 50-69 % `#8F5A22`, <50 % `#96513A`), jauge 12 px (remplissage `success` / `gold` / `error` selon seuil). Alerte douce (fond `#F9E8E0`, bordure 2 px `error`, mascotte 🦊, ton positif : « la leçon lui sera reproposée »). Bouton « Exporter la progression (JSON) » (fond `muted` `#7C755F`, relief `#5C5646`) + lien « ← Retour aux profils ». Accès protégé par code parent (voir SPECIFICATIONS.md).

## Interactions & Behavior
- **Navigation** : profils → carte → (leçon → exercice ×N → fin) → boutique/carte ; espace parent accessible depuis profils (code parent)
- **Audio** : chaque consigne/leçon a un bouton 🔊 → SpeechSynthesis `fr-FR`
- **Exercice** : tap réponse → feedback immédiat (bonne : vert + confettis + son joyeux ; erreur : état doux + explication, l'enfant peut réessayer ou continuer) ; jamais de blocage, jamais de chrono
- **Étape en cours** : pulse 1.6 s ; étapes verrouillées inertes
- **Transitions** : < 300 ms, jamais bloquantes ; tous les sons désactivables
- **Boutons** : press = `translateY(3px)` + relief réduit

## State Management (indicatif)
- Profils : liste `{prénom, avatar, niveau, pièces, étoiles, possessions[]}` (localStorage/IndexedDB — PWA offline)
- Session d'exercices : `{notionId, index, total, réponses[]}` → calcul étoiles/pièces en fin de session
- Progression : maîtrise par domaine + par notion (alimente carte + tableau parent + export JSON)

## Assets
- Aucun asset binaire : emoji natifs comme placeholders (mascotte 🦊, avatars, icônes d'étapes, articles boutique) — à remplacer par des illustrations propres en phase 2
- Police : Baloo 2 via Google Fonts (à self-héberger pour la PWA offline)

## Files
- `MathKids Maquettes.dc.html` — maquettes de référence (turn 2 = les 7 écrans validés ; turn 3 = état bonne réponse ; turn 1 = historique des palettes)
- Docs projet source : `uploads/MathsKid/docs/` (SPECIFICATIONS.md, ARCHITECTURE.md, DESIGN.md, PLAN.md)
