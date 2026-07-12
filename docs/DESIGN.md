# Direction design — MathKids

Deux outils possibles pour le design : **Claude Design** (Anthropic Labs, lancé en avril 2026 — research preview pour abonnés Pro/Max, sur claude.ai) pour explorer et affiner les visuels par conversation, commentaires et éditions directes, avec transfert direct vers Claude Code une fois le design validé ; ou **Claude Code** directement pour générer des maquettes HTML. Ce document fixe la direction visuelle dans les deux cas ; voir §6 pour le workflow recommandé.

## 1. Personnalité visuelle

Univers **« île d'aventure »** : chaque niveau scolaire est une île, chaque notion une étape du chemin. Ton chaleureux, encourageant, jamais scolaire-austère ni criard.

- Style : flat design arrondi, illustrations simples type « cartoon doux »
- Coins très arrondis (rayon 16-24 px), ombres douces, boutons « bonbons » avec léger relief
- Une mascotte (ex. un renard ou une chouette) qui encourage, explique les leçons et fête les réussites

## 2. Palette — VALIDÉE : direction « Nature / aventure » (Claude Design, juillet 2026)

Référence complète : `docs/design-handoff/README.md` (design tokens détaillés, reliefs, dégradés) et `docs/design-handoff/MathKids Maquettes.dc.html` (maquettes des 7 écrans — turn 2 = référence principale).

| Token | Hex | Usage |
|---|---|---|
| sand (fond) | #F7F1E1 | fond des écrans enfant (#F1EAD6 pour l'espace parent) |
| card | #FDFAF0 | cartes, boutons réponse, bulles |
| ink (texte) | #2C3A2E | texte principal (#7C755F secondaire) |
| primary | #2E7D5B | boutons d'action (relief #1D5940) |
| gold | #E9B44C | pièces, badges, étape en cours |
| success | #5F9E38 | jauges, bonne réponse |
| error (douce) | #DA9078 | erreur — terracotta rosé, jamais rouge agressif |

Accents par niveau : CP #5F9E38, CE1 #C96F3B, CE2 #7D5BA6, CM1 #1E8E9E, CM2 #B4527A.
Dégradé carte de l'île : lagon → végétation → sable (#BCE3DE → #D9E8C4 → #F3E5C3).
Relief « bonbon » : `box-shadow: 0 5px 0 <couleur foncée>`, état pressé `translateY(3px)`.

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
