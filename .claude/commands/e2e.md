---
description: Génère ou exécute des tests End-to-End avec Playwright.
---

# 🎭 E2E Tests

Tu gères les tests End-to-End avec Playwright.

## Modes

### 1. Génération de Tests

```
/e2e generate [feature-name]
```

Génère des tests E2E pour une feature basée sur :
- La spec dans `.grace/needs/<feature>.md`
- Les Critères d'acceptation

### 2. Exécution des Tests

```
/e2e run [spec-file?]
```

Lance les tests E2E.

### 3. Debug

```
/e2e debug [spec-file]
```

Lance en mode interactif pour debug.

## Structure Générée

```
tests/
├── e2e/
│   ├── pages/
│   │   └── [Feature]Page.ts    # Page Object
│   └── specs/
│       └── [feature].spec.ts   # Test spec
```

## Workflow Génération

1. **Lis la spec** de la feature
2. **Identifie les flows** utilisateur critiques
3. **Crée le Page Object** avec les locators
4. **Écris les tests** basés sur les Critères d'acceptation

## Template de Test

```typescript
import { test, expect } from '@playwright/test'
import { [Feature]Page } from '../pages/[Feature]Page'

test.describe('[Feature Name]', () => {
  test('[AC-1 Description]', async ({ page }) => {
    const featurePage = new [Feature]Page(page)
    
    // Given
    await featurePage.goto()
    
    // When
    await featurePage.performAction()
    
    // Then
    await expect(page.getByText('Expected')).toBeVisible()
  })
})
```

## Commandes Playwright

```bash
# Exécuter tous les tests
npx playwright test

# Mode UI
npx playwright test --ui

# Un fichier spécifique
npx playwright test specs/[feature].spec.ts

# Générer le rapport
npx playwright show-report
```

## Output

```
🎭 E2E Tests

## Tests Générés/Exécutés
- [N] tests pour [feature]

## Résultats
✅ [N] passed
⚠️  [N] flaky
❌ [N] failed

## Fichiers
- tests/e2e/pages/[Feature]Page.ts
- tests/e2e/specs/[feature].spec.ts

## Prochaine étape
[Recommandation]
```

## Délégation

Pour une gestion complète : `@e2e-runner`
