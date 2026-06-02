---
description: Découpe un brainstorm en tâches atomiques exécutables (sub-tasks Backlog). Orchestre les dépendances et passe l'issue parente en In Progress.
---

# ✅ Task — Découpe atomique & orchestration

Tu découpes les décisions du `/brainstorm` en tâches exécutables et tu crées les sous-tasks dans Backlog.md via le MCP `backlog`.

## Input

- Le `/brainstorm` vient d'être validé (chaînage automatique), OU
- L'utilisateur demande de découper une task Backlog parente existante

## Workflow

### 0. Lecture du besoin et du plan

- Lis le fichier need du contexte projet : `.grace/needs/<feature>.md`
- Récupère le `backlog_task_id` (issue parente)
- Lis task Backlog parente (décisions techniques + acceptance criteria remplis par `/brainstorm`)

### 1. Passer l'issue parente en "In Progress"

Via MCP `backlog` :
1. `task_view` avec le `backlog_task_id`
2. `task_edit` pour changer le statut vers "In Progress"
3. Ajouter dans la description (section `## Notes`) :
   ```
   [{YYYY-MM-DD}] /task : branche `{feat/feature-slug}` créée, découpage en tâches atomiques en cours
   ```

### 2. Générer `tasks.md` local (artefact d'exécution)

Dans sub-tasks Backlog (`backlog task list --parent task-NNN`) :

```markdown
# Tasks: [Feature Name]

## Phase 1: Setup
- [ ] **TASK-001** [setup] Créer la structure de dossiers
  - Fichiers : `src/domain/`, `src/usecases/[feature]/`

## Phase 2: Domain (BDD + TDD ciblé)

### Scénario : [Titre du scénario depuis le need]
- [ ] **TASK-002** [scenario] Écrire le test d'acceptance pour le scénario
  - Given/When/Then : [copié depuis le need]
  - Fichier : `src/usecases/[feature]/[usecase].test.ts`
- [ ] **TASK-003** [impl] Implémenter le comportement du scénario
  - Fichiers : `src/domain/[entity].ts`, `src/usecases/[feature]/[usecase].ts`
  - Dépend de : TASK-002

### Scénario : [Titre du scénario suivant]
- [ ] **TASK-004** [scenario] Écrire le test d'acceptance
- [ ] **TASK-005** [impl] Implémenter le comportement

### Logique domain complexe (TDD)
- [ ] **TASK-006** [test] Test unitaire pour [ValueObject/algorithme]
- [ ] **TASK-007** [impl] Implémenter [ValueObject/algorithme]

## Phase 3: Infrastructure
- [ ] **TASK-008** [impl] Créer l'adapter [AdapterName]

## Phase 4: Integration
- [ ] **TASK-009** [test] Test d'intégration end-to-end
- [ ] **TASK-010** [docs] Mettre à jour .grace/glossary.md
```

### 3. Créer les sous-tasks dans Backlog (OBLIGATOIRE)

Pour chaque tâche atomique de `tasks.md`, créer une task Backlog comme **sous-task** de l'issue parente :

```
task_create avec :
  project_id: <idem parent>
  title: "TASK-XXX [label] Titre court"
  description: "Fichiers : ...\nDépend de : TASK-YYY\nLien Given/When/Then (si scenario) : ..."
  priority: hériter du parent
  parent: <backlog_task_id de la feature>
```

Après création de chaque sous-task :
- `task_edit -l` avec le tag correspondant au label de la tâche (`setup`, `test`, `impl`, etc. — créer via UI Backlog si pas encore dispo)
- `task_edit -a` avec l'utilisateur courant

### 4. Règles de Génération

- Chaque scénario BDD du need génère **un groupe de tâches** : `[scenario]` test PUIS `[impl]`
- Le TDD unitaire (`[test]`/`[impl]`) est ajouté uniquement pour la **logique domain complexe**
- Les tâches `[scenario]` et `[test]` viennent **toujours avant** `[impl]`
- Un TASK-XXX = une unité atomique livrable (1-4h de travail max)

### 5. Labels de tâches (tags Backlog)

| Label | Description |
|-------|-------------|
| `setup` | Configuration, structure |
| `scenario` | Test d'acceptance BDD (Given/When/Then) |
| `test` | Test unitaire TDD (logique domain complexe) |
| `impl` | Implémentation |
| `refactor` | Refactoring |
| `docs` | Documentation |

### 6. Mise à jour frontmatter need

Passer `statut: code-write` dans le frontmatter du fichier need du contexte projet.

## Output

```
✅ Tasks générées : sub-tasks Backlog
📋 Backlog : issue parente "{Titre}" → In Progress
📋 Backlog : [N] sous-tasks créées (liées via parent)
📝 Frontmatter need passé à statut: code-write

Total : [N] tâches
  - Setup : [N]
  - Scénarios BDD : [N]
  - Tests TDD : [N]
  - Impl : [N]
  - Docs : [N]

🚀 Prochaine étape : /plan (écrire les tests, relecture humaine) — ou /build directement si /plan est skippé
```
