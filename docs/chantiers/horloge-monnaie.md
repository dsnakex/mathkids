# Chantier P2 — Horloge (demi-heures, quarts) et monnaie (centimes)

Spécification pour Claude Code. Points BACKLOG.md n°3 et 4. Un commit par composant.

---

## A. Horloge interactive — demi-heures et quarts

### Progression (conforme programmes 2025)
| Palier | Contenu | Niveau |
|---|---|---|
| 1 | Heures entières (existant) | CP |
| 2 | Demi-heures (« 3 heures et demie ») | CE1 |
| 3 | Quarts (« et quart », « moins le quart ») | CE2 |
| 4 | Lecture à 5 minutes près | CE2 |

### Deux sens d'exercice (les deux sont requis)
1. **Lire** : l'horloge affiche une heure → l'enfant choisit parmi 4 réponses en toutes lettres (« 3 heures et demie ») ou saisit sur horloge numérique (palier 4).
2. **Régler** : consigne audio/texte (« Mets l'horloge sur 7 heures et quart ») → l'enfant fait tourner les aiguilles (glisser, avec aimantation aux positions valides : heures pour la petite, 5 min pour la grande).

### LE point pédagogique critique
À la demi-heure et au quart, **la petite aiguille n'est PAS sur le chiffre** : à 3 h 30 elle est à mi-chemin entre 3 et 4 ; à 3 h 45 aux trois quarts. C'est LA difficulté principale pour les enfants et l'erreur classique des apps. Le rendu SVG doit calculer l'angle de la petite aiguille en continu : `angleH = (h % 12) * 30 + m * 0.5`. En mode « régler », les deux aiguilles sont couplées (tourner la grande entraîne la petite).

### Distracteurs plausibles (générateur)
- Aiguilles inversées (lire la grande comme la petite) : 3 h 30 → « 6 heures et 3 minutes »
- Confusion « et demie » / heure suivante : 3 h 30 → « 4 heures et demie »
- « Moins le quart » mal rattaché : 3 h 45 → « 3 heures et quart » et « 4 heures et quart »
- Toujours exactement 1 bonne réponse ; tests unitaires sur les angles et sur chaque famille de distracteurs.

### UX
Horloge SVG ≥ 260 px, chiffres 1-12 très lisibles, aiguilles différenciées (petite épaisse `primary`, grande fine `ink`), graduations des minutes discrètes au palier 4. Habillage univers : cadran assiette, chat-sushi qui dort à côté (« Le chef se lève à... »). Audio de la consigne systématique.

---

## B. Monnaie avec centimes — écriture à virgule

### Progression (conforme programmes 2025 — l'écriture à virgule arrive au CE2 DANS le cadre de la monnaie)
| Palier | Contenu | Niveau |
|---|---|---|
| 1 | Euros entiers : composer/compter (existant) | CP-CE1 |
| 2 | Centimes seuls : composer 65 c avec les pièces | CE2 |
| 3 | Euros + centimes : « 3 € et 45 c » ↔ « 3,45 € » | CE2 |
| 4 | Rendu de monnaie avec centimes | CE2+ |

### Types d'exercices
1. **Composer une somme** : cible affichée (« 2,80 € ») → glisser pièces/billets sur le plateau ; le total en cours s'affiche en continu ; plusieurs compositions valides acceptées (valider le TOTAL, pas une combinaison unique).
2. **Compter une somme** : pièces posées → saisir le total (pavé avec virgule) ou QCM.
3. **Convertir** : « 3 € et 45 c = ? » → saisie « 3,45 € » (et sens inverse).
4. **Rendre la monnaie** : « L'article coûte 2,60 €, tu donnes 5 € » → composer le rendu.

### Pièces et billets (valeurs réelles, dessins SVG simplifiés)
1 c, 2 c, 5 c (cuivre) · 10 c, 20 c, 50 c (or) · 1 €, 2 € (bicolores) · billets 5, 10, 20, 50 € (tailles/couleurs distinctes). Taille tactile ≥ 56 px.

### LE piège pédagogique critique
La confusion `3,5 € / 3,05 € / 3,50 €` : le générateur de distracteurs DOIT l'exploiter (pour 3 € et 5 c, proposer 3,50 € en distracteur ; pour 3 € et 50 c, proposer 3,05 €). La correction bienveillante explique : « 3,05 €, c'est 3 euros et 5 centimes — les centimes se comptent sur 2 chiffres ». Accepter « 3,5 » ET « 3,50 » comme saisies correctes pour 3,50 €.

### Règles moteur
- Montants en **centimes entiers** en interne (jamais de flottants : 0.1 + 0.2 ≠ 0.3) ; formatage français à l'affichage (virgule, symbole € après).
- Rendu de monnaie : toute composition dont le total est exact est juste.
- Tests : conversions €/centimes, formatage/parsing (virgule et point acceptés en saisie), familles de distracteurs, aucune somme générée impossible à composer avec les pièces disponibles.

### UX
Plateau = comptoir du restaurant (l'enfant paie le chef chat-nigiri) ; pièces qui « clinquent » doucement à la pose (son désactivable). Habillage : les prix sont ceux des sushis de la boutique.

---

## Intégration
- Nouveaux `GeneratorSpec` : `clock-read`, `clock-set`, `money-compose`, `money-count`, `money-convert`, `money-change` avec leurs `params` (palier, plage horaire, montant max...).
- Brancher dans les curriculums : CE1 (demi-heures), CE2 (quarts, centimes, virgule) — remplacer les éventuels QCM provisoires sur ces notions.
- Leçons courtes associées (1-2 écrans) : « la petite aiguille voyage entre les chiffres » ; « les centimes se comptent sur 2 chiffres ».
- `npm run lint && npm run test` avant chaque commit.
