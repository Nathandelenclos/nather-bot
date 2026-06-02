---
description: Spécifier un besoin fonctionnel sous forme de User Stories + scénarios BDD. Écrit la spec dans le contexte projet et crée l'issue dans Backlog.md.
---

# 📋 Spécification de Besoin

Tu spécifies un besoin fonctionnel sous forme de User Stories. Tu ne codes RIEN. Tu ne fais AUCUN choix technique. Tu captures le QUOI et le POURQUOI, jamais le COMMENT.

## Input

L'utilisateur fournit le besoin sous l'une de ces formes :

1. **Texte libre** : description en langage naturel de ce qu'il veut
2. **Lien GitHub issue** : URL `https://github.com/<org>/<repo>/issues/<N>` → extraire via `gh issue view <URL> --json title,body,labels,assignees`
3. **Clé Jira** : `PROJ-123` → extraire via `jira issue view PROJ-123` (nécessite CLI `jira` configuré)
4. **ID Linear** : `LIN-456` → extraire via `linear issue view LIN-456` (nécessite CLI `linear` configuré)

**Prérequis outils** : les CLIs (`gh`, `jira`, `linear`) doivent être installés et authentifiés sur le poste du développeur. Si l'outil n'est pas disponible, signaler : *"CLI `<tool>` non trouvé. Installe-le ou colle le contenu du ticket directement."*

**Extraction** : récupérer titre, description, labels/tags, et les reformuler en User Stories + scenarios BDD. Le ticket source est un **input**, pas une copie — la spec BDD est toujours produite dans le format standard du need.

## Workflow

### 0. Analyse du Contexte (OBLIGATOIRE)

**AVANT de spécifier quoi que ce soit**, tu DOIS comprendre l'historique du projet pour produire une spec pertinente et non redondante. Deux sources :

#### 0.1 Contexte contexte projet

Lire :
- `.grace/context.md` — objectif, état actuel, décisions clés, contraintes
- `.grace/needs/` — specs BDD existantes (autres features du projet)

Si le projet n'existe pas dans le contexte projet : signaler à l'utilisateur qu'il faut d'abord `/project-new <slug>` côté contexte projet.

#### 0.2 État des tasks Backlog

```
OUTIL: MCP backlog → task_list (filtré sur le project_id depuis CLAUDE.md → ## Backlog.md)
```

Récupérer les issues du projet et les classer par état :
- **Done** : Ce qui a été réalisé
- **In Progress** : Ce qui est en cours (dépendances potentielles)
- **In Review** : En attente de validation
- **Backlog / Todo** : Planifié (éviter les doublons)

Pour chaque issue **Done** ou **In Progress** qui semble liée au besoin exprimé :
- `task_view` → lire description complète, décisions techniques, notes
- Extraire : besoins couverts, contraintes découvertes, leçons apprises, termes métier existants

#### 0.3 Afficher le contexte complet

```
📊 Contexte projet :

📖 Vault (context.md) :
- Objectif : {résumé}
- Deadline : {date ou souple}
- État actuel : {3-5 dernières lignes datées}
- Décisions clés : {liste courte}

📋 Historique Backlog :
- {N} issues Done — résumés courts des plus pertinentes
- {N} issues In Progress — ce qui est en cours
- {N} issues Backlog/Todo — à ne pas dupliquer

🔗 Features du contexte projet déjà spécifiées (needs/) :
- [[needs/<feature-1>]] — statut {ready-to-dev | tests-write | etc.}
- [[needs/<feature-2>]]

⚠️ Contraintes identifiées depuis l'historique :
- {contrainte 1}
- {contrainte 2}
```

**Cette analyse est NON NÉGOCIABLE** — ne jamais passer à la clarification sans ce contexte.

### 1. Clarification

En s'appuyant sur le contexte récupéré, pose des questions clarifiantes :
- Qui sont les utilisateurs ?
- Quels sont les scénarios principaux ?
- Quelles sont les contraintes ? (mentionner les contraintes déjà connues depuis l'historique)
- Y a-t-il des dépendances avec des tasks Backlog en cours ? (citer les In Progress identifiées)
- Le besoin étend-il une feature existante du contexte projet ? (citer les needs/ liés)

### 2. Création du fichier need dans le contexte projet

Chemin : `.grace/needs/<feature-slug>.md`

### 3. Génération du contenu BDD

Structure stricte :

```markdown
---
slug: <feature-slug>
projet: <slug du contexte projet>
date_creation: YYYY-MM-DD
statut: ready-to-dev | tests-write | code-write | qa-ok | done
backlog_task_id: <UUID de la task Backlog parente — rempli après création>
---

# [Feature Name]

## Comportement attendu

[1-3 phrases point de vue utilisateur final]

## Acteur principal

[utilisateur, admin, système, cron…]

## Contraintes métier

- [Contrainte non-négociable]
- [...]

## User Stories

### US-1: [Titre] (P1)
**En tant que** [persona]
**Je souhaite** [action/capacité]
**Afin de** [bénéfice / valeur métier]

### US-2: [Titre] (P2)
...

## Scenarios Given/When/Then

### Happy path — [titre]
- **Given** [contexte initial]
- **When** [action déclenchée]
- **Then** [résultat attendu observable]

### Cas d'erreur — [titre]
- **Given** [...]
- **When** [...]
- **Then** [...]

### Cas limite — [titre]
...

## Tests métier à écrire

1. `test_happy_path_name`
2. `test_error_case_name`
3. `test_edge_case_name`

**Principe** : un test = un scenario observable, pas d'assertion sur l'implémentation.

## Glossaire métier

| Terme | Définition |
|-------|------------|
| [Concept] | [Définition dans le langage du domaine] |

## Hors périmètre

- [Ce qui n'est PAS inclus dans ce besoin]

## Implémentation

<!-- Section éditée par @builder / @git-operator au fur et à mesure -->

### PRs
(à remplir)

### Tests exécutés
(à remplir)

### Date de réalisation
(à remplir au merge)
```

### 4. Création de la task Backlog (OBLIGATOIRE)

Après la génération du fichier need, crée l'issue dans Backlog.md via MCP :

1. **Récupérer les IDs nécessaires** :
   - `project_id` : depuis CLAUDE.md → ## Backlog.md
   - `member_id` : : Backlog.md est local single-user, l'assignee est `mderoullers` (pas d'appel d'API)
   - `tags` : via `backlog config` (clé labels dans backlog/config.yml)

2. **`task_create`** avec :

| Champ | Valeur |
|-------|--------|
| `project_id` | ID du projet depuis CLAUDE.md |
| `title` | Titre de la feature |
| `priority` | Demander à l'utilisateur (`urgent`/`high`/`medium`/`low`), `medium` par défaut |
| `description` | Résumé 5-10 lignes + lien vers le fichier need du contexte projet |

**Template description** (Markdown, pas HTML) :

```markdown
Spec complète : `.grace/needs/<feature-slug>.md` dans le contexte projet.

## Comportement attendu
{1-3 phrases}

## User Stories
- **US-1 (P1)** : En tant que {persona}, je souhaite {action} afin de {bénéfice}
- **US-2 (P2)** : ...

## Contraintes métier
- {contrainte 1}
- {contrainte 2}

## Tests à écrire
1. `test_name_1`
2. `test_name_2`

## Commits & PRs
(aucun pour l'instant — édité par @git-operator)

## Décisions techniques
(à définir dans /blueprint)

## Notes
(historique par étape du workflow)
```

3. **Assigner l'issue** via `task_edit -a` → `member_id` de l'utilisateur courant

4. **Tagger l'issue** via `task_edit -l` : au moins 1 tag de type (`feature`, `bug`, `refactor`, etc.)

5. **Récupérer l'issue_id** retourné et **mettre à jour** le frontmatter du fichier need avec `backlog_task_id: <uuid>`

6. **Update `context.md` du contexte projet** : ajouter dans `## État actuel` :
   ```
   - YYYY-MM-DD : besoin "{titre}" spécifié (need + task Backlog {id}), statut ready-to-dev
   ```

### 5. Consultation expert (opt-in)

Si le besoin touche à une dimension **structurante** (scope ambitieux, acteurs nouveaux, contraintes métier fortes, positionnement produit, UX inédite), proposer une consultation ciblée :

1. Lire `context.md § Experts pertinents` du projet. Si la section existe, présenter les experts listés pertinents pour ce besoin.
2. Si la section n'existe pas (vieux projet), suggérer l'expert évident selon le domaine (ex : positionnement → `@expert-marketing` ; UX nouvelle → `@expert-ux-designer` ; feature à fort enjeu utilisateur → `@expert-storyteller`).
3. Proposer : *"Ce besoin implique un choix de scope / positionnement / UX qui mériterait un challenge. Consulter `@expert-<slug>` maintenant ? [y/N]"*
4. **Ne pas forcer.** Si `y` → lancer `@expert-<slug>` avec le contenu du need comme contexte. Si `N` → continuer.
5. Si la consultation tranche une décision (ex : "on cible smallest viable audience, pas mass market"), ajouter à `context.md § Décisions clés` :
   ```
   - YYYY-MM-DD : <décision> (need {titre}). [[experts/<slug>]] cite [[<article-wiki>]].
   ```

**Quand SKIPPER cette étape** : besoin trivial (CRUD standard, fix bug, ajout champ), ou scope déjà très clair via historique. Pas de proposition forcée pour ne pas polluer le workflow.

## Règles

- **Besoin uniquement** : `/need` spécifie le QUOI et le POURQUOI. Aucun choix technique, framework ou langage.
- **Format "En tant que... Je souhaite... Afin de..."** obligatoire.
- **Scenarios G/W/T obligatoires** : chaque US DOIT avoir au moins 1 scenario.
- **Tests métier = comportement observable**, pas d'implémentation testée.
- **Langage métier** dans le glossaire.

## Output

```
📋 Besoin spécifié : .grace/needs/<feature-slug>.md
📋 Task Backlog créée : "{Titre}" ({issue_id})

User Stories : [N] (P1: X, P2: Y)
Scenarios BDD : [N]
Tests à écrire : [N]
Glossaire : [N] termes
Priorité : [priority]
Statut : ready-to-dev

📝 Vault context.md mis à jour (section État actuel)

🚀 Prochaine étape : /brainstorm (choix techniques et acceptance criteria)
```
