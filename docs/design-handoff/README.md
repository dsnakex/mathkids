# Handoff : MathKids — PWA d'apprentissage des maths (6-11 ans) · Univers « Chats-Sushis »

## Overview
MathKids est une PWA d'apprentissage des maths pour enfants de 6 à 11 ans (école primaire française, CP → CM2). **Univers validé : les chats-sushis (neko-sushi)** — des chats chibi lovés dans des sushis (le riz est leur lit ou costume, la garniture leur couverture ou chapeau). La mascotte-guide est un **chef chat-nigiri à toque** présent sur tous les écrans. Les niveaux scolaires sont des mondes de restaurant kawaii, la progression est un **tapis roulant à sushis**, les récompenses sont des **grains de riz dorés 🍚**, étoiles ⭐ et **assiettes de collection**.

Cible d'implémentation : **React + Tailwind** (souhait explicite du client).

## About the Design Files
`MathKids Maquettes.dc.html` est une **référence design HTML** (pas du code de production). Turns de référence :
- **turn 9 (#9a)** : les 7 écrans validés — référence principale
- **turn 10 (#10a)** : les 3 états de l'exercice (neutre / bonne réponse / erreur douce)
- **turn 8 (#8a)** : définition des personnages SVG (symboles `<symbol>` réutilisables)
- turns 1-7 : historique d'explorations (ne pas implémenter)

`neko-sushi-sprites.svg` contient les personnages SVG extraits, prêts à convertir en composants React.

## Fidelity
**High-fidelity** : couleurs, typographie, espacements, états, personnages SVG. Recréer fidèlement. Les quelques emoji restants (🍣 supports de comptage, articles boutique, 🏮 décor) sont des placeholders acceptables en v1.

## Contraintes non négociables
- Contrastes AA, texte ≥ 18 px (16-17 px uniquement pour métadonnées secondaires), gros chiffres ≥ 34 px
- Cibles tactiles ≥ 48 px (boutons audio 52 px, réponses ≥ 70 px de haut)
- Erreur toujours **douce** (gingembre rosé, jamais rouge), messages encourageants (« Presque ! … »), jamais négatifs ; réessai toujours possible
- Aucune pub, aucun chrono visible, aucun classement
- Tutoiement, très peu de texte, bouton audio (Web Speech API `fr-FR`) sur chaque consigne/leçon
- Une couleur d'accent distincte par niveau scolaire

## Design Tokens

### Couleurs (univers chats-sushis)
| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FCF7EE` | fond des écrans enfant (riz crème) |
| `bg-parent` | `#F6EFDD` | fond espace parent (plus sobre) |
| `card` | `#FFFFFF` | cartes, boutons réponse, bulles |
| `ink` | `#4A4038` | texte principal |
| `muted` | `#847C6C` | texte secondaire, liens discrets (relief bouton `#5F594C`) |
| `primary` | `#C25A38` (relief `#8E3F24`) | boutons d'action (saumon foncé), toque du chef |
| `gold` | `#F5DFA0` (texte `#6B4A0E`, relief `#C0A458`) | riz doré, badges, étape en cours |
| `success` | `#4E9A5F` (fond `#EDF5E2`, texte `#3E6B24`, relief `#A9C487`) | bonne réponse, jauges, possédé |
| `error` | `#E2A69B` (fond `#FAECE8`, texte `#9A5244`, relief `#E5C3BA`) | erreur douce gingembre rosé |
| `shadow-card` | `#E8DCC4` | relief 3D des cartes/boutons clairs |
| `track` | `#E3D5BC` (bord `#D9C9A8`) | jauge bol de riz ; remplissage `#FFFDF7` (riz blanc) |
| `belt` | rayures `#E8DFCC` / `#DCD1B9` | tapis roulant (repeating-linear-gradient 90°, pas 16 px) |
| `nori` | dégradé `#57634F → #3F4A3B` | nori, cônes, sangles |
| `rice` | dégradé `#FFFFFF → #F3EBD8` (grains `#E6D9BC`) | riz |
| `prix` | `#8E5A22` | prix boutique |

### Accents par niveau (mondes)
| Niveau | Monde | Hex |
|---|---|---|
| CP | Bar à sushis | `#D9704C` |
| CE1 | Monde des Makis | `#4E9A5F` (relief `#357043`) |
| CE2 | Jardin à thé matcha | `#8A9A2F` |
| CM1 | Monde des Ramens | `#C98A3B` |
| CM2 | Grand Banquet | `#C4699E` |

### Dégradé carte du monde
`linear-gradient(#FDF3E4 0%, #FAE4D6 50%, #FDF6EA 100%)` · fin de session : `linear-gradient(#FCF7EE 0%, #FAE4D6 100%)`

### Typographie
- Famille unique : **Baloo 2** (Google Fonts, self-héberger pour l'offline), graisses 500-800
- Corps/bulles : 18 px w700 · Consignes : 21 px w800 · Titres : 24-28 px w800
- Grande question : 44-48 px w800 · Réponses : 34 px w800 · Métadonnées : 16-17 px w700 (minimum)

### Rayons & relief « bonbon »
- Cartes écran : 24-28 px · Boutons : 24-26 px · Petites cartes : 16-18 px · Pastilles : 999 px
- Relief : `box-shadow: 0 5px 0 <couleur foncée>` (4 px petits, 3 px pastilles) ; pressé : `translateY(3px)` + shadow réduite
- Bulles de dialogue : radius `22 22 22 6` (mascotte à gauche) / `6 22 22 22` (mascotte au-dessus)

## Les personnages SVG (voir `neko-sushi-sprites.svg`)
Construction en couches, dans cet ordre : assiette → queue → riz (+ grains en petits arcs) → garniture → oreilles (extérieur + intérieur rose `#F6B9AE`) → tête (dégradé robe) → rayures/taches → yeux → truffe `#E2766B` → bouche → joues (ellipses `#F0958D` opacity .55) → moustaches (stroke 1.6-1.8, `stroke-linecap="round"`) → pattes (2 ellipses + traits d'orteils).

| Personnage | Robe | Sushi | Rôle carte |
|---|---|---|---|
| `ns-chef` | roux tigré | nigiri + toque blanche à bande `primary` + tablier nori | mascotte-guide (tous écrans) |
| `ns-nigiri` | roux tigré (`#F7C494→#EFA76C`, rayures `#DE9257`) | saumon strié en couverture | étape réussie |
| `ns-maki` | calico (blanc `#FDF8EC`, taches orange `#F0A468` + noire) | rouleau nori, cœur avocat | étape réussie + avatar Léa |
| `ns-tamago` | gris tigré (`#D8CFC4→#C2B6A8`) | omelette `#F7D97E→#EFC75B` + sangle nori | étape réussie |
| `ns-temaki` | noir (`#6E655F→#544C48`), yeux dorés `#F5D26B` | cône nori | étape EN COURS + avatar Tom |
| `ns-onigiri` | crème | triangle de riz (costume, oreilles qui dépassent) + nori | étape verrouillée (endormi) |
| `ns-maki-dodo` | gris | rouleau nori éteint `#7C8574→#636D5C` | étape verrouillée (endormi) |

### Expressions (3 états réutilisables)
- **Heureux** (étape réussie) : yeux en arcs `q4.5 -6 9 0`, bouche ouverte joyeuse (path fill `#8A5240` + langue `#F0958D`)
- **Éveillé** (en cours, chef) : yeux ellipses avec 2 reflets blancs + **clignement** : `<animate attributeName="ry" values="6;6;.7;6" keyTimes="0;.86;.92;1" dur="3.2s" repeatCount="indefinite"/>` (chef : dur 4s)
- **Endormi** (verrouillé) : arcs fermés vers le bas `q4 4.5 8 0`, couleurs désaturées, opacity .9, badge 💤 — pas de cadenas
- Bouche par défaut : « ω » en path `M.. q3 4 6 0 q3 4 6 0`

En React : un composant `<NekoSushi variant="nigiri|maki|tamago|temaki|onigiri" expression="happy|awake|sleep" />` avec les couches partagées et robe/garniture par variante.

## Screens (turn 9 du fichier, cartes 390×760)

### 1. Choix du profil
Fond `bg`, centré. Chef 96 px, « Qui joue aujourd'hui ? » 28 px, sous-titre « Choisis ton chat-sushi ! » `muted`. Cartes profil 134 px (blanc, radius 24, relief `shadow-card`) : avatar SVG chat-sushi ~84 px, prénom 19 px w800, chip niveau (fond accent du niveau, blanc). Bouton « + » : 3 px dashed `#D3C6AC`. Lien discret « 🏮 Espace parent » souligné `muted`.

### 2. Carte du monde (tapis roulant)
Fond dégradé carte. Topbar : pastille monde (accent niveau, nowrap 17 px), 🍚 145 (gold), ⭐ 23 (fond `#E4EFD9`, texte `#3E6B24`). Chemin en zigzag : 4 segments de **tapis roulant** rayés (h 20 px, radius 10, rotations ~28°/62°/150°/55°). 6 étapes = personnages SVG (~94 px) : 3 heureux avec ⭐ gagnées sous l'assiette, 1 en cours (pulse `scale 1→1.09` 1.8 s + clignement + ✨ + pastille gold « ✖️ La table de 2 »), 2 endormis 💤 (opacity .9). Décor discret : 🏮 + 2 ✨. En bas : chef 88 px + bulle blanche 18 px.

### 3. Leçon interactive (les moitiés)
Fond `bg`. Header : « Leçon · Les moitiés » 20 px + bouton audio patte. Zone : carte blanche flex-1 (liseré `inset 0 0 0 3px #EFE4CC`) — **grand maki coupé en 2 parts égales** en SVG (2 rondelles nori/riz/avocat identiques + trait de coupe pointillé `primary`), texte 19 px avec « 2 parts égales » en `primary`. Chef 60 px + bulle. Bouton « J'ai compris ! » pleine largeur `primary`.

### 4. Exercice — 3 états (turn 10)
Structure commune : header (chef 42 px + 🍚 + jauge **bol de riz** : track `track`, remplissage blanc riz, bord `#D9C9A8` + « 4/9 ») ; consigne (bouton audio **patte de chat** 52 px : 3 coussinets + pad blanc + ♪, texte 21 px « Partage les 8 sushis en 2 assiettes égales ! ») ; carte question « 8 ÷ 2 = ? » 48 px + 2 assiettes-pastilles de 4 🍣 ; grille 2×2 de réponses 34 px (blanc, radius 26, relief `shadow-card`).
- **Neutre** : pas de feedback, invite « Touche ta réponse 🐾 » `muted`
- **Bonne réponse** : « 4 ✓ » (bordure `success`, fond `#EDF5E2`, relief `#A9C487`), autres réponses opacity .5, équation complétée « = 4 » vert, assiettes passées en vert, confettis `mkfall` (translateY + rotate, durées 2.7-3.8 s, délais négatifs), feedback vert avec chef qui pulse + ✨ : « Miam, bravo Léa ! 4 + 4 = 8… », jauge 5/9, bouton « Continuer 🥢 »
- **Erreur douce** : « 6 » bordure `error` fond `#FAECE8`, feedback chef : « Presque ! Mets 4 sushis dans chaque assiette : 4 + 4 = 8 🍣 », bouton « Réessayer 🐾 ». Jamais de croix, jamais « Faux ! »

### 5. Fin de session
Fond dégradé, centré, confettis `mkfall` en continu. Chef 110 px qui pulse + ✨. « Miam, quelle séance, Léa ! » 28 px, 3 ⭐ 60 px, carte « 🍚 +12 grains de riz dorés », badge gold « 🍽️ Assiette de collection “Reine des moitiés” ». Bouton « Dépenser mon riz doré » + lien « Retour au monde ».

### 6. Boutique « Le comptoir du chef »
Fond `bg`. Header : titre 24 px + solde 🍚 157 (gold). Carte aperçu : avatar SVG 74 px + « Léa · chat-maki calico » + « garniture : avocat 🥑 + bandeau 🎀 ». 3 sections (titres 18 px), grilles 3 colonnes : **Garnitures** (🥑 possédé, 🍤 40, 🍳 40), **Accessoires** (🎀 possédé, cape de nori 🦸 80, wasabi rigolo 🟢 60), **Fonds d'écran** (🏮 80, 🌸 80, 🗻 100). Possédé : bordure `success` + « Possédé ✔ ». Prix en 🍚 couleur `prix`. Achat uniquement en riz gagné — aucun achat réel. Bouton « Retour au monde 🥢 ».

### 7. Tableau de bord parent
Fond `bg-parent`, plus sobre (pas de tapis roulant ni confettis). « 🏮 Espace parent — Léa (CE1) » 21 px, « Cette semaine : 4 sessions · 52 minutes » `muted`. 4 jauges de maîtrise (Nombres 82 %, Calcul 61 %, Problèmes 38 %, Grandeurs et mesures 74 %) : pourcentage coloré (≥70 % `#3E6B24`, 50-69 % `#8E5A22`, <50 % `#9A5244`), remplissage `success`/`#E9B44C`/`error`. Alerte bienveillante (fond `#FAECE8`, bordure 2 px `error`, mini-chef SVG) : « Léa bloque sur “problèmes à 2 étapes” : le chef lui reproposera la leçon… ». Bouton « Exporter la progression (JSON) » (`muted`) + lien retour. Accès protégé par code parent.

## Interactions & Behavior
- Navigation : profils → carte → (leçon → exercices ×N → fin) → boutique/carte ; espace parent depuis profils (code parent)
- Audio : SpeechSynthesis `fr-FR` sur chaque consigne/leçon (bouton patte)
- Exercice : tap → feedback immédiat ; bonne réponse : confettis + son joyeux (désactivable) ; erreur : réessai possible, jamais de blocage ni chrono
- Étape en cours : pulse + clignement ; endormis inertes ; transitions < 300 ms
- Boutons pressés : `translateY(3px)` + relief réduit
- Étoiles de fin de session : basées sur la réussite, jamais comparées à d'autres enfants

## State Management (indicatif)
- Profils : `{prénom, variante de chat (robe), sushi (garniture), accessoires[], niveau, rizDoré, étoiles, assiettes[]}` — localStorage/IndexedDB (PWA offline)
- Session : `{notionId, index, total, réponses[]}` → étoiles/riz en fin de session
- Progression : maîtrise par domaine + notion (carte + parent + export JSON)

## Assets
- `neko-sushi-sprites.svg` : les 7 symboles personnages + dégradés (ids `ns-*`, `g*`)
- Emoji placeholders v1 : 🍣 (comptage), articles boutique, 🏮 🌸 ✨ (décor)
- Police Baloo 2 à self-héberger

## Files
- `MathKids Maquettes.dc.html` — maquettes (turns 8-10 = référence ; turns 1-7 = historique)
- `neko-sushi-sprites.svg` — composants SVG des personnages
- Docs projet source : `uploads/MathsKid/docs/` dans le projet d'origine
