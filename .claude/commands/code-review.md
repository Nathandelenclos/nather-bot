---
description: Lance une revue de code complète sur les fichiers modifiés ou spécifiés.
---

# 🔍 Code Review

Tu effectues une revue de code approfondie.

## Input

- Chemin vers fichier(s) à reviewer, OU
- Review des fichiers modifiés (non commités)

## Checklist de Review

### 1. Qualité du Code

| Critère | Vérifié |
|---------|---------|
| Nommage clair et descriptif | ☐ |
| Fonctions courtes (< 50 lignes) | ☐ |
| Fichiers focalisés (< 400 lignes) | ☐ |
| Pas de nesting profond (> 4) | ☐ |
| Immutabilité respectée | ☐ |
| Pas de duplication | ☐ |

### 2. Sécurité

| Critère | Vérifié |
|---------|---------|
| Pas de secrets hardcodés | ☐ |
| Entrées validées | ☐ |
| Requêtes paramétrées | ☐ |
| Pas de console.log | ☐ |

### 3. Tests

| Critère | Vérifié |
|---------|---------|
| Tests présents | ☐ |
| Coverage suffisant (80%+) | ☐ |
| Tests behavior-only | ☐ |

### 4. Architecture (DDD)

| Critère | Vérifié |
|---------|---------|
| Domain sans dépendances externes | ☐ |
| Séparation des responsabilités | ☐ |
| Use cases isolés | ☐ |

## Niveaux de Commentaires

| Niveau | Signification |
|--------|---------------|
| 🔴 **BLOCKER** | Doit être corrigé avant merge |
| 🟠 **MAJOR** | Devrait être corrigé |
| 🟡 **MINOR** | Amélioration suggérée |
| 💡 **NIT** | Optionnel, préférence |

## 5. Mise à jour Backlog (OBLIGATOIRE)

Après la review, mets à jour la task Backlog correspondante via MCP `backlog` :

1. **Identifier l'issue** : via `task_list` filtré sur `status: In Progress` + search par feature slug
2. **`task_view`** pour lire la description
3. **Si APPROVED** :
   - `task_edit` → changer le statut vers "In Review"
4. **Si CHANGES REQUESTED** :
   - Garder le state "In Progress"
5. **Ajouter un log détaillé dans `## Notes`** de la description :
   ```
   [{YYYY-MM-DD}] /code-review :
   - Verdict : APPROVED | CHANGES REQUESTED
   - Fichiers analysés : {liste}
   - Findings : {N blockers, M major, K minor}
   - Actions requises : {liste si CHANGES REQUESTED, sinon "aucune"}
   ```

## Output

```
🔍 Code Review Report

## Fichiers Analysés
- [fichier1]
- [fichier2]

## Findings

### 🔴 BLOCKER
**[fichier:ligne]** : [description]
```suggestion
[code suggéré]
```

### 🟠 MAJOR
...

### 🟡 MINOR
...

## Verdict
✅ APPROVED - Prêt pour merge
   ou
⚠️ CHANGES REQUESTED - [N] blockers à corriger

📋 Backlog : issue "{titre}" mise à jour → [In Review / blockers notés]
```

## Délégation

Pour une review de sécurité approfondie : `@security-reviewer`
