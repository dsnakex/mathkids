# Guide de démarrage — MathKids avec Claude Code

Guide pas à pas pour débutant. Durée de mise en route : ~30 minutes.

## 1. Installer les outils (une seule fois)

1. **Node.js** : téléchargez la version LTS sur https://nodejs.org et installez-la.
2. **Git** : téléchargez sur https://git-scm.com et installez (options par défaut).
3. **Claude Code** : ouvrez un terminal (PowerShell sous Windows) et tapez :
   ```
   npm install -g @anthropic-ai/claude-code
   ```
   Il faut un abonnement Claude Pro/Max ou une clé API Anthropic. Documentation : https://docs.claude.com/en/docs/claude-code
4. (Recommandé) **VS Code** (https://code.visualstudio.com) pour ouvrir et lire les fichiers du projet.

## 2. Créer le projet

```
mkdir mathkids
cd mathkids
mkdir docs
```

Copiez ensuite les fichiers de ce kit :

| Fichier du kit | Destination |
|---|---|
| CLAUDE.md | `mathkids/CLAUDE.md` (racine) |
| SPECIFICATIONS.md | `mathkids/docs/SPECIFICATIONS.md` |
| ARCHITECTURE.md | `mathkids/docs/ARCHITECTURE.md` |
| DESIGN.md | `mathkids/docs/DESIGN.md` |
| PLAN.md | `mathkids/docs/PLAN.md` |
| BENCHMARK.md | `mathkids/docs/BENCHMARK.md` |

## 3. Lancer Claude Code

Dans le dossier `mathkids` :

```
claude
```

Claude Code lit automatiquement `CLAUDE.md`. Copiez-collez alors le **prompt de la Phase 0** de `docs/PLAN.md`, puis avancez phase par phase.

## 4. Rythme conseillé

| Étape | Phases | Résultat |
|---|---|---|
| Semaine 1 | 0 + 1 | Projet lancé + maquettes validées en famille |
| Semaines 2-3 | 2 + 3 | Contenu CP + moteur testé |
| Semaines 4-5 | 4 + 5 | App jouable complète pour le CP |
| Semaine 6 | 6 | PWA installable et offline |
| Ensuite | 7 + 8 | CE1→CM2 puis mise en ligne |

(Rythme indicatif à quelques heures par semaine — Claude Code écrit le code, votre travail est surtout de tester et valider.)

## 5. Les 5 commandes à connaître

```
npm run dev      # voir l'app dans le navigateur (http://localhost:5173)
npm run test     # vérifier que tout fonctionne
git add -A && git commit -m "étape validée"   # sauvegarder un état qui marche
git log --oneline                             # voir l'historique
claude           # (re)lancer Claude Code dans le dossier
```

## 6. Bonnes pratiques avec Claude Code

- **Une demande à la fois** : suivez les prompts du PLAN.md, ne demandez pas trois choses en même temps.
- **Vérifiez chaque phase** dans le navigateur avant de passer à la suivante.
- **Commitez souvent** : après chaque étape qui fonctionne. En cas de problème : « reviens au dernier commit ».
- **En cas d'erreur** : copiez le message d'erreur complet dans Claude Code et demandez de corriger en expliquant.
- **Pour le design** : itérez sur les maquettes HTML (Phase 1) avec des retours concrets (« boutons plus gros », « couleurs plus douces ») avant de coder l'app.
- Utilisez `/clear` dans Claude Code entre deux phases pour repartir d'un contex