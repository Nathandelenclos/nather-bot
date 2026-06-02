---
description: Reprendre une issue Backlog.md existante et charger tout le contexte nécessaire (spec BDD du contexte projet, ADRs, état projet). Point d'entrée du workflow craft quand la spec existe déjà. Passe la main à /brainstorm ensuite.
---

# 🎯 Pick an existing Backlog issue

Tu reprends une issue **déjà créée dans Backlog.md** (par toi, l'user, ou un coéquipier) pour la travailler. Tu charges tout le contexte pertinent (spec BDD dans le contexte projet, ADRs, état du projet) avant de lancer `/brainstorm`.

## Input

- Un **ID d'task Backlog** (UUID complet) ou
- Un **slug / fragment de titre** (ex: `/pick auth-oidc` → recherche dans les issues)

## Workflow

### 1. Récupération de la task Backlog

1. Si l'input est un UUID valide : `task_view` via MCP `backlog`
2. Sinon, recherche :
   - `task_list` avec `search: "<slug>"` (pas besoin — 1 backlog par repo)
   - Si un seul résultat : le prendre
   - Si plusieurs : afficher les titres + IDs, demander à l'utilisateur lequel
   - Si zéro : proposer `/need` pour créer un nouveau besoin, sortir

Récupérer : `title`, `description`, `priority`, `status`, `tags`, `assignees`, `parent`, lien vers need du contexte projet (extrait de la description).

### 2. Charger la spec BDD du contexte projet (OBLIGATOIRE)

La description de la task Backlog doit référencer un fichier need dans le contexte projet :
`.grace/needs/<feature>.md`

- Lire le fichier need complet
- Récupérer : User Stories, scenarios Given/When/Then, tests métier à écrire, glossaire, contraintes

**Si le fichier need n'existe pas** :
- Soit l'issue a été créée directement dans Backlog sans passer par `/need`
- Soit le lien est cassé
- **Proposer à l'utilisateur** :
  - (a) créer rétroactivement le fichier need depuis la description de la task Backlog → lancer un mini-`/need` pour générer le BDD à partir du contexte existant
  - (b) continuer sans spec formelle (risqué — pas de source de vérité BDD)

Recommandé : (a), sauf si la description Backlog est déjà très complète.

### 3. Charger le contexte projet

- `.grace/context.md` en entier — incluant la section `## Décisions clés` (ADRs inline, format `- YYYY-MM-DD : choix X parce que Y`)
- Les 2-3 dernières autres specs need (`.grace/needs/*.md` triés par date) pour repérer les dépendances

### 4. Afficher le résumé structuré

```
🎯 Issue reprise : "<titre>" (#<sequence_id>, <priority>)

📖 Spec BDD : .grace/needs/<feature>.md
  User Stories : [N] (P1: X, P2: Y)
  Scenarios : [N] (happy path, erreurs, limites)
  Tests à écrire : [N]
  Statut : <ready-to-dev | tests-write | code-write | qa-ok | done>

🏗 Contexte projet :
  Objectif : {résumé context.md}
  État actuel : {3 dernières lignes datées}
  Décisions clés récentes : {2-3 dernières}

🔗 Dépendances détectées :
  - Tasks Backlog In Progress / In Review : {liste courte}
  - Autres needs liés : {liste}

⚠️ Gaps identifiés (si applicable) :
  - [fichier need manquant / incomplet / scenarios peu couverts]

🚀 Prochaine étape : /brainstorm (plan technique d'implémentation)
```

### 5. Passer l'issue en "In Progress" (optionnel, selon état actuel)

Si le `status` actuel de l'issue est `Todo` ou `Backlog` :
- Demander à l'utilisateur : "Passer l'issue en In Progress maintenant ?" (défaut oui)
- Si oui : `task_edit` → statut = "In Progress"
- Ajouter dans la description section `## Notes` :
  ```
  [YYYY-MM-DD] /pick : démarrage du travail. Branche à créer : `feat/<feature-slug>` ou `fix/<slug>`
  ```

Si le `status` est déjà `In Progress` (reprise d'un travail en cours) : ne pas toucher au state, juste ajouter un log dans Notes :
```
[YYYY-MM-DD] /pick : reprise du travail en cours
```

### 6. Update contexte projet context.md

Ajouter dans `## État actuel` du `context.md` du contexte projet :
```
- YYYY-MM-DD : reprise issue "<titre>" (Backlog #<seq>) → /brainstorm
```

## Règles

- **Ne créer aucun fichier** dans ce skill — uniquement lecture + update task Backlog
- **Toujours valider** que la spec need existe avant de passer à `/brainstorm`
- **Ne pas sauter la section "Dépendances détectées"** — c'est ce qui évite de casser un travail en cours

## Output

```
✅ Task Backlog active : "<titre>" (#<seq>)
📋 Spec BDD chargée : .grace/needs/<feature>.md
📝 Contexte projet chargé : {N} ADRs, {N} autres needs

🚀 Prochaine étape : /brainstorm
```
