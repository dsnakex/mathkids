# Chantier P3 — Banque de problèmes rédigés

Le contenu est livré dans `src/content/problems/{cp,ce1,ce2,cm1,cm2}.json` (rédigé à la main, conforme aux programmes 2025-2026). Ce document définit le schéma et ce que le moteur doit implémenter.

## Schéma d'un problème

```json
{
  "id": "ce1-comp-01",
  "structure": "comparaison",        // ajout | retrait | reunion | complement | transformation | comparaison | multiplication | division | deux-etapes | proportionnalite | fraction | mesure | pourcentage
  "etapes": 1,
  "tier": 2,                          // palier de difficulté suggéré (1-5)
  "template": "Léa a {a} billes. Tom en a {b} de plus qu'elle. Combien Tom a-t-il de billes ?",
  "vars": { "a": { "min": 5, "max": 30 }, "b": { "min": 2, "max": 10 } },
  "derived": {},                      // variables calculées, ex. { "c": "a*b" } pour garantir des divisions exactes
  "constraints": ["a+b<=40"],         // à satisfaire au tirage (rejeter et retirer sinon)
  "answer": "a+b",
  "unit": "billes",
  "answerFormat": "int",              // int | euros (euros : vars et answer en CENTIMES entiers, affichage français "3,45 €")
  "hints": [
    "Dessine un schéma en barres : la barre de Tom est plus longue que celle de Léa.",
    "Tom a autant que Léa, PLUS {b}. C'est une addition : {a} + {b}."
  ],
  "explanation": "Tom a {a} + {b} = {answer} billes. « De plus » veut dire qu'on ajoute."
}
```

## Règles moteur (à implémenter dans src/engine/generators/problem.ts)

1. **Tirage** : choisir un problème du niveau/structure/tier demandés par le GeneratorSpec, tirer les `vars` dans leurs bornes, calculer `derived`, rejeter/retirer si une contrainte échoue (max 50 essais), substituer dans `template`, `hints`, `explanation` — y compris `{answer}`.
2. **Réponse** : évaluer `answer` avec un mini-évaluateur arithmétique maison (+ - * / et parenthèses uniquement — PAS de `eval`). Toute réponse doit être un entier (ou un montant exact en centimes si `answerFormat: "euros"`) : c'est garanti par construction via `derived`, un test doit le vérifier pour chaque gabarit sur 200 tirages.
3. **Placeholders monétaires** : dans les templates, `{a:€}` affiche la variable (en centimes) au format français « 12,50 € ».
4. **Indices en 2 temps** : l'UI affiche l'indice 1 à la demande, puis l'indice 2 ; en cas d'erreur, `explanation`. Aucun malus lié aux indices.
5. **Audio** : l'énoncé substitué est lisible par la synthèse vocale (bouton 🔊 existant).
6. **Saisie** : réponse au pavé numérique (avec virgule si `answerFormat: "euros"` — réutiliser le MoneyPad).
7. **Curriculum** : brancher les `GeneratorSpec` de type `problem` existants sur la banque (matcher `structure`, `etapes`, et `max` ↔ bornes/tier). Signaler les specs sans problème correspondant (test).

## Règles de contenu respectées (pour relecture)

- CP : une étape, pas de schéma en barres dans les indices (dessin/comptage/droite graduée) — programme 2025.
- Schéma en barres dans les indices à partir du CE1.
- Fractions dès le CE1 (moitié/quart comme partage), décimaux et proportionnalité dès le CM1, pourcentages/échelles/vitesse au CM2.
- Tutoiement, prénoms variés, contextes du quotidien (+ quelques clins d'œil sushis), vocabulaire officiel.
