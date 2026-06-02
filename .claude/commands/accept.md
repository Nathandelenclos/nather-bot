---
description: Créer la PR après une review réussie. Commits atomiques, PR propre, mise à jour Backlog et need.
---

# ✅ Accept — Créer la PR

Tu crées la Pull Request après une review réussie (`/review` → PASS). Tu t'assures que les commits sont propres, la PR est bien formatée, et le Backlog est synchronisé.

## Input

- Le `/review` vient de passer (verdict PASS ou PASS avec réserves), OU
- L'utilisateur demande de créer la PR pour une task Backlog spécifique

## Workflow

### 1. Vérifier les prérequis

**NE JAMAIS démarrer** sans :
1. `/review` → verdict PASS ou PASS avec réserves
2. Tous les tests GREEN
3. Le lint passe
4. Le fichier need : `.grace/needs/<feature>.md` avec `statut: qa-ok`

### 2. Nettoyer l'historique Git

Vérifier la qualité des commits sur la branche :
- Chaque commit suit le format conventional commits
- Chaque commit référence le need (`Refs: needs/<feature>.md`) ou la task (`TASK-NNN`)
- Pas de commit "WIP" ou "fix typo" orphelin (les squasher si nécessaire via rebase interactif — **avec accord de l'utilisateur**)

### 3. Créer la Pull Request

Via `gh pr create` :

```bash
gh pr create \
  --title "<type>(<scope>): <description courte>" \
  --body "$(cat <<'EOF'
## Summary

<résumé du need en 2-3 lignes>

## Need

Spec complète : `.grace/needs/<feature>.md`

## Changes

- <changement 1>
- <changement 2>
- <changement 3>

## Acceptance Criteria

- [x] AC-1 : <critère>
- [x] AC-2 : <critère>

## Tests

- [N] scenarios BDD GREEN
- [M] tests unitaires GREEN
- [K] règles d'archi GREEN
- Tests manuels : <résumé>

## Backlog

Task : TASK-NNN (<titre>)

🤖 Generated with craft workflow (/need → /brainstorm → /task → /plan → /build → /review → /accept)
EOF
)"
```

### 4. Sync Backlog (OBLIGATOIRE)

Via MCP `backlog` → `task_edit` de l'issue parente :
1. Passer en "In Review" (la PR est ouverte, en attente de merge)
2. Ajouter dans `## Notes` :
   ```
   [{YYYY-MM-DD}] /accept :
   - PR créée : <URL de la PR>
   - Commits : [N]
   - Prochaine étape : merge par l'humain
   ```
3. Ajouter dans `## Commits & PRs` de la description :
   ```
   - PR #<N> : <URL>
   ```

### 5. Sync need

Mettre à jour le frontmatter : `statut: done` (la PR est ouverte, le workflow craft est terminé).

Ajouter dans `## Implémentation` du need :
```markdown
### PRs
- PR #<N> : <URL>

### Tests exécutés
- [N] scenarios BDD
- [M] tests unitaires
- [K] règles d'archi

### Date de réalisation
YYYY-MM-DD
```

### 6. Sync context.md

Ajouter dans `.grace/context.md § État actuel` :
```
- YYYY-MM-DD : feature "<titre>" livrée (PR #<N>, need <feature-slug>)
```

## Output

```
✅ PR créée

🔗 PR : <URL>
📋 Task Backlog : statut → In Review
📝 Need : statut → done
📝 Context.md : état actuel mis à jour

Workflow terminé : /need → /brainstorm → /task → /plan → /build → /review → /accept ✅
```
