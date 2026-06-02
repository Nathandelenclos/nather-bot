---
description: Commit les tests validés par l'humain puis délègue à @builder pour implémenter (RED → GREEN → REFACTOR). Suit les bonnes pratiques de code.
---

# 🔨 Build — Implémentation guidée par les tests

Tu orchestre l'implémentation du code. Tu commites d'abord les tests validés par l'humain (depuis `/plan`), puis tu délègues à `@builder` pour faire passer les tests de RED à GREEN en suivant les bonnes pratiques de code.

## Input

- Le `/plan` vient d'être validé (tests écrits et relus par l'humain), OU
- Le `/task` vient d'être validé et `/plan` a été skippé (besoin devops/infra), OU
- L'utilisateur demande de builder une task Backlog spécifique

## Workflow

### 1. Vérifier les prérequis

**NE JAMAIS démarrer** sans avoir vérifié :
1. Le fichier need du contexte projet existe : `.grace/needs/<feature>.md`
2. La task Backlog parente est en "In Progress"
3. Les sous-tasks existent (créées par `/task`)

Si `/plan` n'a PAS été skippé :
4. Les tests sont écrits et validés par l'humain
5. Les tests sont **RED** (confirmé par exécution)

Si `/plan` a été skippé :
4. Les acceptance criteria du `/brainstorm` servent de guide (pas de tests formels)

### 2. Commiter les tests (si /plan n'a pas été skippé)

Avant toute implémentation, créer un commit atomique pour les tests :

```bash
git add <fichiers-de-tests>
git commit -m "test(<feature>): add BDD scenarios + unit tests (RED)

Refs: needs/<feature>.md
TASK-NNN"
```

### 3. Déléguer à @builder

Passer la main à `@builder` pour chaque sous-task `[impl]` dans l'ordre défini par `/task`.

`@builder` travaille **par sous-task** :
1. Lire la sous-task Backlog (description, fichiers ciblés, dépendances)
2. Implémenter le code pour faire passer les tests de RED à GREEN
3. Refactorer (REFACTOR phase du cycle TDD)
4. Commiter atomiquement
5. Passer la sous-task en "Done"
6. Passer à la sous-task suivante

### 4. Règles de code (transmises à @builder)

- **Ne JAMAIS modifier les tests** (sauf refactor demandé explicitement par l'humain)
- **Commits atomiques** : un commit par sous-task, pas de commit monstre
- **Conventional commits** : `feat(<scope>): <description>` avec `Refs: needs/<feature>.md`
- **Tests GREEN avant chaque commit** : never commit on red
- **Domain purity** : `domain/` ne dépend de rien d'externe (framework, DB, HTTP)
- **Naming** : termes du glossaire (`.grace/glossary.md`)

### 5. Points de contrôle

Après chaque groupe de sous-tasks (typiquement 3-5), faire un point :

```
🔨 Build progress

Sous-tasks terminées : [N]/[Total]
  ✅ TASK-001 [setup] Structure créée
  ✅ TASK-002 [scenario] Test BDD happy path
  ✅ TASK-003 [impl] Implémentation happy path
  🔄 TASK-004 [scenario] Test BDD erreur...

Tests : [N] GREEN / [M] RED / [K] total
Commits : [N] créés

Continuer ? (go / pause / ajuste)
```

### 6. Sync Backlog (pendant le build)

Via MCP `backlog`, pour chaque sous-task terminée :
1. `task_edit` → statut "Done"
2. Ajouter dans `## Notes` de la task parente :
   ```
   [{YYYY-MM-DD}] /build : TASK-NNN [label] terminée — commit <hash court>
   ```

### 7. Finalisation

Quand toutes les sous-tasks `[impl]` sont terminées :
1. Exécuter la suite de tests complète (tous les tests, pas juste ceux du need)
2. Exécuter le linter
3. Vérifier qu'il n'y a pas de régression

```
🔨 Build terminé

Sous-tasks : [N]/[N] terminées
Tests : tous GREEN
Commits : [N] créés
Lint : ✅

🚀 Prochaine étape : /review (vérification finale + tests manuels)
```

## Anti-patterns

- Commencer à coder sans tests écrits (sauf si `/plan` a été skippé explicitement)
- Modifier un test pour qu'il passe au lieu de corriger le code
- Commiter avec des tests RED
- Un seul gros commit à la fin au lieu de commits atomiques par sous-task
- Implémenter des fonctionnalités non couvertes par le need

## Output

```
🔨 Build terminé

📋 Sous-tasks : [N]/[N] terminées
✅ Tests : tous GREEN ([N] BDD + [M] unit + [K] archi)
📝 Commits : [N] créés (conventional commits)
🧹 Lint : ✅

🚀 Prochaine étape : /review
```
