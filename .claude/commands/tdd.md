---
description: Lance le cycle TDD pour la logique domain complexe (algorithmes, invariants, value objects).
---

# 🔴🟢🔵 TDD Workflow

> ⚠️ Ce workflow est recommandé pour la **logique domain complexe** (algorithmes, invariants, value objects). Pour les features complètes, préférer le workflow BDD via `/craft` + `@builder`.

Tu lances le cycle Test-Driven Development pour implémenter de la logique domain complexe.

## Input

- Nom de la feature/use case à implémenter
- Optionnel : chemin vers la spec dans `backlog/tasks/` (et `.grace/needs/`)

## Workflow TDD Strict

### 1. 🔴 RED - Écrire le Test

```
1. Identifie le comportement à tester depuis la spec (si disponible)
2. Écris un test qui vérifie ce comportement
3. Lance les tests → DOIT ÉCHOUER
```

⚠️ **Preuve obligatoire** : Tu DOIS voir `FAIL` dans le terminal

### 2. 🟢 GREEN - Implémenter le Minimum

```
1. Écris le code MINIMAL pour faire passer le test
2. Pas de fonctionnalité supplémentaire
3. Lance les tests → DOIT PASSER
```

⚠️ **Preuve obligatoire** : Tu DOIS voir `PASS` dans le terminal

### 3. 🔵 REFACTOR - Améliorer

```
1. Améliore le code sans changer le comportement
2. Lance /detect-smells si disponible
3. Relance les tests → DOIT TOUJOURS PASSER
```

## Règles Behavior Testing

- ⛔ JAMAIS tester les méthodes privées
- ⛔ JAMAIS vérifier l'état interne
- ⛔ JAMAIS mocker les détails d'implémentation
- ✅ Tester UNIQUEMENT Input → Output
- ✅ Tests doivent survivre au refactoring

## Commandes Utilisées

```bash
# Test command depuis settings.json
[commands.test]

# Ou par défaut
npm test
pnpm test
```

## Output

À chaque cycle TDD :

```
🔴 RED: Test écrit pour [comportement]
   ✅ Test échoue comme attendu

🟢 GREEN: Implémentation minimale
   ✅ Test passe

🔵 REFACTOR: [amélioration effectuée]
   ✅ Tests passent toujours

---
Cycle [N] complété
Fichiers : [liste]
Coverage : [X]%
```

## Délégation

Pour une implémentation plus guidée, utilise `@builder`.
