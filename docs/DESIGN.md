# Direction design — MathKids

Deux outils possibles pour le design : **Claude Design** (Anthropic Labs, lancé en avril 2026 — research preview pour abonnés Pro/Max, sur claude.ai) pour explorer et affiner les visuels par conversation, commentaires et éditions directes, avec transfert direct vers Claude Code une fois le design validé ; ou **Claude Code** directement pour générer des maquettes HTML. Ce document fixe la direction visuelle dans les deux cas ; voir §6 pour le workflow recommandé.

## 1. Personnalité visuelle

Univers **kawaii « chats-sushis » (neko-sushi)** — validé en juillet 2026 (remplace l'univers « île d'aventure ») : des chats chibi lovés dans des sushis. Chaque niveau scolaire est un monde de restaurant kawaii (CP Bar à sushis, CE1 Monde des Makis, CE2 Jardin à thé matcha, CM1 Monde des Ramens, CM2 Grand Banquet), la progression est un tapis roulant à sushis, chaque étape EST un chat-sushi (heureux/en cours/endormi). Ton chaleureux, encourageant, jamais scolaire-austère ni criard.

- Style : flat kawaii arrondi, personnages SVG en couches (voir `design-handoff/neko-sushi-sprites.svg`)
- Coins très arrondis (rayon 16-28 px), ombres douces, boutons « bonbons » avec relief
- Mascotte : **chef chat-nigiri à toque**, présente sur tous les écrans ; récompenses = grains de riz dorés, étoiles, assiettes de collection
- Règle d'or : le thème est incarné dans chaque élément d'UI (étapes, avatars, jauge bol de riz, bouton audio patte de chat…), mais la lisibilité des maths prime toujours (fonds calmes, gros chiffres)

## 2. Palette — VALIDÉE : univers « Chats-Sushis » (Claude Design, juillet 2026, v2)

Référence complète : `docs/design-handoff/README.md` (design tokens détaillés, specs par écran, personnages) ; maquettes dans `docs/design-handoff/MathKids Maquettes.dc.html` (turn 9 = les 7 écrans validés, turn 10 = les 3 états de l'exercice, turn 8 = personnages SVG) ; sprites dans `docs/design-handoff/neko-sushi-sprites.svg`.

| Token | Hex | Usage |
|---|---|---|
| bg (fond) | #FCF7EE | fond des écrans enfant, riz crème (#F6EFDD pour l'espace parent) |
| card | #FFFFFF | cartes, boutons réponse, bulles |
| ink (texte) | #4A4038 | texte principal (#847C6C secondaire) |
| primary | #C25A38 | boutons d'action, saumon foncé (relief #8E3F24) |
| gold | #F5DFA0 | riz doré, badges, étape en cours (texte #6B4A0E) |
| success | #4E9A5F | bonne réponse, jauges |
| error (douce) | #E2A69B | erreur — gingembre rosé, jamais rouge agressif |

Accents par niveau/monde : CP #D9704C (Bar à sushis), CE1 #4E9A5F (Makis), CE2 #8A9A2F (Thé matcha), CM1 #C98A3B (Ramens), CM2 #C4699E (Grand Banquet).
Relief « bonbon » : `box-shadow: 0 5px 0 <couleur foncée>`, état pressé `translateY(3px)`.
Personnages : composant React `<NekoSushi variant="chef|nigiri|maki|tamago|temaki|onigiri" expression="happy|awake|sleep" />` d'après les sprites SVG.

## 3. Typographie et lisibilité

- Police : **Baloo 2** (validée — graisses 500/600/700/800, à self-héberger pour la PWA offline), taille min 18 px, gros chiffres (34 px+) dans les exercices, grande question 48 px
- Option « police adaptée dyslexie » dans les réglages
- Cibles tactiles ≥ 48 px, espacement généreux
- Peu de texte à l'écran ; icônes + audio pour les non-lecteurs (CP)

## 4. Écrans clés (maquettes à générer en Phase 1)

1. **Choix du profil** — grille d'avatars, bouton « + » pour le parent
2. **Carte de l'île** — chemin d'étapes avec cadenas/étoiles, mascotte
3. **Leçon** — mascotte + zone d'animation + bouton audio + « J'ai compris ! »
4. **Exercice** — consigne en haut (+ haut-parleur), zone d'interaction centrale, jauge de progression de session, feedback plein écran (confettis si réussite / correction bienveillante sinon)
5. **Fin de session** — étoiles gagnées, pièces, badge éventuel
6. **Boutique avatar** — accessoires à acheter avec les pièces
7. **Tableau de bord parent** — jauges de maîtrise par domaine, accès par code

## 5. Animations et sons

- Feedback immédiat : bonne réponse = confettis + son joyeux court ; erreur = « oups » doux + affichage de la solution expliquée
- Transitions courtes (< 300 ms), jamais bloquantes
- Tous les sons désactivables (usage en classe / soir)

## 6. Workflow design recommandé

Une première maquette HTML des 7 écrans existe déjà : `docs/maquettes.html` (à ouvrir dans un navigateur). Deux voies pour l'améliorer :

**Voie A — Claude Design (recommandée pour l'exploration visuelle)**
1. Ouvrir Claude Design sur claude.ai (abonnement Pro/Max requis, research preview).
2. Lui donner ce document (DESIGN.md) + une capture de `maquettes.html` comme point de départ, et demander les 7 écrans.
3. Itérer par conversation, commentaires inline et éditions directes — plus rapide que des allers-retours en code pour les choix visuels (mascotte, couleurs, illustrations).
4. Une fois validé : exporter en HTML ou transférer directement à Claude Code, qui transpose en composants React + config Tailwind.

**Voie B — Claude Code seul**
1. Itérer directement sur `docs/maquettes.html` (« boutons plus gros », « fond plus doux »…).
2. Une fois validée, Claude Code transpose en composants React réutilisables et consigne les choix dans la config Tailwind.

Dans les deux cas : valider les maquettes avec les enfants **avant** de coder l'app réelle, et consigner ici toute décision qui modifie la palette ou la typo.
