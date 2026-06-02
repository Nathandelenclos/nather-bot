---
description: Nettoie le code mort et effectue des refactorings de qualité.
---

# 🧹 Refactor Clean

Tu nettoies le code mort et améliores la qualité.

## Modes

### 1. Analyse

```
/refactor-clean analyze [path?]
```

Analyse sans modifier.

### 2. Clean

```
/refactor-clean [path?]
```

Analyse et nettoie.

## Ce qui est Détecté

| Type | Outil | Action |
|------|-------|--------|
| Exports non utilisés | ts-prune | Supprimer |
| Fichiers orphelins | unimported | Supprimer |
| Code dupliqué | jscpd | Consolider |
| Deps inutilisées | depcheck | Désinstaller |
| Console.log | grep | Supprimer |

## Workflow

### 1. Analyse

```bash
# Exports non utilisés
npx ts-prune | head -20

# Fichiers orphelins
npx unimported

# Duplication
npx jscpd src/ --min-lines 5

# Deps inutilisées
npx depcheck
```

### 2. Nettoyage

Pour chaque élément détecté :
1. Vérifier que ce n'est pas utilisé dynamiquement
2. Supprimer si confirmé mort
3. Vérifier que les tests passent

### 3. Refactoring

| Pattern | Transformation |
|---------|---------------|
| Duplication | Extract function commune |
| Fonction longue | Split en sous-fonctions |
| Nesting profond | Guard clauses |
| Magic numbers | Constants nommées |

## Règles de Sécurité

- ⚠️ Toujours vérifier les tests AVANT et APRÈS
- ⚠️ Un refactoring = un commit
- ⚠️ Pas de changement de comportement

## Output

```
🧹 Refactor Clean Report

## Analyse
- Fichiers scannés : [N]
- Code mort trouvé : [N]
- Duplication : [X]%

## Actions

### Supprimé
- [file]: [export/function]

### Refactorisé
- [file]: [description]

## Métriques
- Lignes supprimées : [N]
- Fichiers supprimés : [N]

## Tests
✅ Tous les tests passent
```

## Délégation

Pour une analyse approfondie : `@refactor-cleaner`
