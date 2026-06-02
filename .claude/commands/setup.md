---
description: Initialise la configuration Craft pour ce projet. Interview sur tech stack, Backlog.md + contexte projet, puis configure Claude Code.
---

# 🚀 Craft Project Initialization

Tu es un assistant d'initialisation pour le framework Craft (DDD/TDD/BDD) avec intégration **Backlog.md** (tracker) et **contexte projet** (contexte + besoins BDD).

## Ta Mission

Interviewer l'utilisateur pour configurer ce projet, puis mettre à jour les fichiers de configuration.

## Étape 0 : Backlog.md + Vault

**AVANT toutes les autres questions**, configure le tracker et le contexte projet :

### 0.1 Vérifier le MCP Backlog.md

Vérifier via `claude mcp list` que `backlog: ✓ Connected` apparaît. Sinon :
```bash
# Installer si absent
bun add -g backlog.md   # ou npm i -g backlog.md
# Brancher le MCP en scope user
claude mcp add backlog --scope user -- backlog mcp start
```

### 0.2 Initialiser le `backlog/` du projet (1 backlog par repo)

Si le repo n'a pas encore de dossier `backlog/`, l'initialiser :
```bash
backlog init "<Nom du projet>" \
  --integration-mode mcp \
  --backlog-dir backlog \
  --zero-padded-ids 3
```
Cela crée :
- `backlog/config.yml` (project_name, statuses, task_prefix, labels, assignee)
- `backlog/tasks/` (où vivront les fichiers task-001 - <slug>.md)
- `backlog/{drafts,archive,completed,milestones,decisions,docs}/`

Si le repo a déjà un `backlog/`, on saute cette étape.

### 0.3 Assignee par défaut

Backlog.md est single-user local — pas d'API d'auth. L'assignee est typiquement le username GitHub (`gh api user --jq .login`). Stocké dans `backlog/config.yml` clé `default_assignee` ou ajouté à chaque task via `--assignee`.

### 0.4 Configurer les labels du projet

Éditer `backlog/config.yml` clé `labels:` pour ajouter les labels de type standards :
```yaml
labels:
  - feature
  - bug
  - refactor
  - docs
  - chore
  - design
  - infra
  - test
  # labels de découpe BDD :
  - setup
  - scenario
  - impl
```
Backlog.md accepte les labels libres (pas de validation stricte), mais les déclarer ici garantit l'autocomplétion et la cohérence.

### 0.5 Contexte projet

Vérifier que le répertoire de contexte projet existe : `.grace/`.

Demander : *"Ce projet a-t-il un répertoire de contexte configuré ? (chemin ou 'non, à créer')"*.

- Si **oui** → lire `.grace/context.md` pour contexte ; ajouter `tracker: backlog.md` et `backlog_dir: backlog` dans le frontmatter si absent
- Si **non** → créer `.grace/context.md` avec un template minimal avant de continuer `/setup`

### 0.6 Afficher l'état actuel

```bash
backlog overview              # statistiques projet
backlog task list --plain     # liste textuelle
```

```
📊 Backlog.md : <project_name>
   - Tasks To Do : {N}
   - Tasks In Progress : {N}
   - Tasks Done récentes : {top 3}

📖 Vault : .grace/context.md
   - Objectif : {résumé}
   - État actuel : {3 dernières lignes}
   - Besoins existants (needs/) : {N}

⚠️ Tasks sans label : {N}
⚠️ Tasks sans priorité : {N}
```

## Étape 1 : Interview (tech stack)

Pose ces questions UNE PAR UNE.

### Questions obligatoires

1. **Nom du projet** : "Quel est le nom de ce projet ?"

2. **Langage principal** : "Quel langage utilises-tu ?"
   - TypeScript, JavaScript, Python, Go, Java, Kotlin, Rust, autre

3. **Framework de test** :
   - TypeScript/JS : Vitest, Jest, Mocha
   - Python : Pytest, unittest
   - Go : go test
   - Java/Kotlin : JUnit
   - Rust : cargo test

4. **Commande de test** : `npm test`, `pnpm test`, `pytest`, `go test ./...`, etc.

5. **Linter** :
   - TypeScript/JS : ESLint, Biome
   - Python : Ruff, Flake8, Pylint
   - Go : golangci-lint
   - Rust : clippy

6. **Commande de lint** : `npm run lint`, `pnpm lint`, `ruff check .`, `golangci-lint run`, etc.

### Questions optionnelles

7. **Structure src** : "As-tu une structure DDD (`src/domain`, `src/usecases`, `src/infrastructure`) ? Sinon, créer ?"

## Étape 2 : Configuration

### 2.1 `.claude/settings.json`

Fusion sécurisée des clés `commands` et `hooks`, sans supprimer `permissions`.

```json
{
  "permissions": { "defaultMode": "bypassPermissions" },
  "commands": {
    "test": "[COMMANDE_TEST]",
    "lint": "[COMMANDE_LINT]"
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[COMMANDE_LINT] --fix || true"
          }
        ]
      }
    ]
  }
}
```

### 2.2 `.mcp.json` (optionnel — Backlog est en scope user global)

Le MCP `backlog` est généralement configuré en scope user dans `~/.claude.json` (`claude mcp add backlog --scope user -- backlog mcp start`). Pas besoin d'un `.mcp.json` local sauf si tu veux pinner la config par projet :

```json
{
  "mcpServers": {
    "backlog": {
      "command": "backlog",
      "args": ["mcp", "start"],
      "env": {
        "BACKLOG_CWD": "<absolute-path-to-this-repo>"
      }
    }
  }
}
```

### 2.3 `CLAUDE.md`

Mettre à jour la section `## Backlog.md` avec :
- Project name : [NOM_PROJET]
- Backlog dir : `backlog/`
- Statuses : `To Do`, `In Progress`, `Done`
- Task prefix : `task` (zero-padded 3 chiffres)
- Assignee par défaut : [USERNAME_GITHUB]

Mettre à jour la section `## Contexte projet` avec le chemin `.grace`.

Mettre à jour `## Tech Stack`.

### 2.4 Structure DDD (si demandé)

```
src/
├── domain/
├── usecases/
└── infrastructure/
```

## Étape 3 : Confirmation

```
✅ Craft initialisé pour [PROJECT_NAME]

📁 Fichiers modifiés :
  - .claude/settings.json (hooks test/lint)
  - backlog/ initialisé (config.yml + tasks/)
  - CLAUDE.md (Backlog.md + contexte + stack)

🛠 Stack :
  - Langage : [LANGAGE]
  - Tests : [COMMANDE_TEST]
  - Lint : [COMMANDE_LINT]

📋 Backlog.md :
  - Project name : [NOM_PROJET]
  - Backlog dir : backlog/
  - Statuses : To Do / In Progress / Done
  - Labels configurés : [N]
  - Tasks ouvertes : [N]

📖 Contexte projet :
  - Répertoire : .grace/
  - Besoins existants : [N]

🚀 Prochaines étapes :
  1. /need - Crée ta première spec BDD (dans le contexte projet + task Backlog.md)
```
