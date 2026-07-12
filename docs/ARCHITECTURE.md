# Architecture technique — MathKids

## 1. Choix de stack

Critères : simplicité pour un débutant assisté par Claude Code, PWA offline, hébergement gratuit, diffusion facile.

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **React 18 + Vite** | Le plus documenté, Claude Code y excelle, build rapide |
| Langage | **TypeScript** | Les types évitent des bugs que le débutant ne saurait pas déboguer |
| Styles | **Tailwind CSS** | Design rapide et cohérent, pas de fichiers CSS à gérer |
| PWA | **vite-plugin-pwa** (Workbox) | Service worker et manifest générés automatiquement |
| Stockage local | **IndexedDB via Dexie.js** | Profils et progression persistants hors ligne |
| État | **Zustand** | Plus simple que Redux, suffisant |
| Audio | **Web Speech API** | Synthèse vocale des consignes, sans fichiers audio |
| Animations | **CSS + Framer Motion** (parcimonie) | Feedback ludique |
| Tests | **Vitest** | Tests du moteur adaptatif et des générateurs d'exercices |
| Hébergement | **Vercel ou Netlify** (gratuit) | Déploiement automatique à chaque push GitHub |

Pas de backend, pas de base de données serveur : tout est statique + stockage local. Coût : 0 €.

## 2. Structure du projet

```
mathkids/
├── CLAUDE.md                  # Instructions pour Claude Code
├── docs/                      # SPECIFICATIONS.md, DESIGN.md, PLAN.md
├── public/
│   ├── icons/                 # Icônes PWA
│   └── images/                # Illustrations, avatars
├── src/
│   ├── app/                   # Routage, layout, providers
│   ├── components/            # Composants UI réutilisables (Button, Card…)
│   ├── features/
│   │   ├── profile/           # Multi-profils, avatars, boutique
│   │   ├── lesson/            # Leçons interactives
│   │   ├── exercise/          # Moteur de rendu des 7 types d'exercices
│   │   ├── session/           # Orchestration d'une session (60/25/15)
│   │   ├── map/               # Île de progression
│   │   ├── rewards/           # Étoiles, pièces, badges
│   │   └── parent/            # Tableau de bord parent
│   ├── engine/
│   │   ├── adaptive.ts        # Paliers, maîtrise, montée/descente
│   │   ├── spaced.ts          # Révision espacée (Leitner J+2/J+7/J+30)
│   │   ├── generators/        # Gabarits d'exercices paramétrés
│   │   └── prerequisites.ts   # Graphe de prérequis entre notions
│   ├── content/
│   │   ├── curriculum/        # cp.json, ce1.json, ce2.json, cm1.json, cm2.json
│   │   ├── lessons/           # Leçons par notion
│   │   └── problems/          # Banque de problèmes rédigés
│   ├── db/                    # Schéma Dexie, accès IndexedDB
│   └── utils/
└── tests/
```

**Principe clé : le contenu est de la donnée, pas du code.** Ajouter une notion = éditer un JSON, sans toucher au moteur.

## 3. Modèle de données

```ts
// Contenu (statique, dans /content)
Level      { id: "cp"|"ce1"|"ce2"|"cm1"|"cm2", domains: Domain[] }
Domain     { id, name, notions: Notion[] }            // ex. "calcul"
Notion     { id, name, prerequisites: string[],       // ex. "tables-x2-x5"
             lesson: LessonRef, tiers: Tier[5] }
Tier       { level: 1..5, generators: GeneratorSpec[], problems?: ProblemRef[] }
GeneratorSpec { type: "qcm"|"input"|"dragdrop"|"truefalse"|"gap"|"visual"|"problem",
                params: {...} }                        // ex. { max: 100, op: "+" }

// Progression (IndexedDB, par profil)
Profile    { id, name, avatar, level, coins, settings }
Mastery    { profileId, notionId, score: 0-100, tier: 1-5,
             streak, lastSeen, nextReview }            // révision espacée
SessionLog { profileId, date, notionIds, correct, total, durationSec }
Badge      { profileId, badgeId, earnedAt }
```

## 4. Moteur adaptatif — logique

```
répondre(notion, correct):
  correct → streak++ ; score += gain(tier)
            si streak == 4 et tier < 5 → tier++, streak = 0
  erreur  → errStreak++ ; score -= perte
            si errStreak == 2 → tier-- (min 1), proposer la leçon
  planifier nextReview selon boîte de Leitner (J+2 → J+7 → J+30)
  notion acquise si score ≥ 80 et tier ≥ tierCible(niveau scolaire)
```

Cette logique vit dans `engine/` en TypeScript pur, **sans dépendance UI**, donc testable unitairement — c'est la partie la plus critique de l'app.

## 5. PWA et offline

- `vite-plugin-pwa` : manifest (nom, icônes, couleur, mode standalone) + service worker en precache (tout le bundle + contenu JSON).
- Fonctionnement 100 % offline après première visite ; bannière « Installer l'application » sur mobile/tablette.
- IndexedDB : les données survivent à la fermeture et fonctionnent hors ligne. Export/import de la progression en fichier JSON (sauvegarde manuelle, transfert entre appareils).

## 6. Diffusion

**v1 — Web (immédiat, gratuit)**
1. Code sur GitHub (dépôt public ou privé).
2. Vercel/Netlify connecté au dépôt : chaque `git push` déploie automatiquement sur une URL `https://mathkids.vercel.app` (domaine personnalisé possible ~10 €/an).
3. Partage par simple lien ; installation en 2 taps depuis le navigateur (PWA).

**v2 — Magasins d'applications (optionnel, plus tard)**
- **Google Play** : TWA (Trusted Web Activity) via Bubblewrap ou PWABuilder — la PWA est empaquetée telle quelle. Compte développeur : 25 $ une fois.
- **App Store** : empaquetage via **Capacitor** (la même base de code React). Compte développeur Apple : 99 $/an. Apple exige une vraie valeur ajoutée native — à envisager seulement si l'app a du succès.
- Point d'attention diffusion publique : app destinée aux enfants → aucune pub, aucun tracking, mentions claires (notre architecture sans compte ni serveur satisfait déjà RGPD/COPPA par conception).

**Licence** : si diffusion publique souhaitée, choisir une licence (MIT si open source) et vérifier que toutes les images/sons utilisés sont libres de droits.

## 7. Qualité

- Tests unitaires sur `engine/` et `generators/` (chaque gabarit produit des exercices valides et des réponses correctes).
- Vérification systématique : chaque exercice généré a exactement une bonne réponse.
- CI GitHub Actions : lint + tests à chaque push (Claude Code peut la configurer).
