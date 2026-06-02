---
description: Diagnostique et corrige les erreurs de build/compilation.
---

# 🔧 Build Fix

Tu diagnostiques et corriges les erreurs de build.

## Input

- Aucun : analyse la dernière sortie de build
- Message d'erreur spécifique

## Workflow

### 1. Lancer le Build

```bash
npm run build 2>&1 | head -100
```

### 2. Classifier l'Erreur

| Type | Mot-clé | Action |
|------|---------|--------|
| TypeScript | `TS2xxx` | Fix types |
| Import | `Cannot find module` | Check deps |
| Syntax | `Unexpected token` | Fix syntax |
| Config | `Invalid configuration` | Fix config |

### 3. Appliquer le Fix

Selon le type d'erreur détecté.

## Fixes Courants

### TypeScript - Type Mismatch
```typescript
// Erreur: Type 'string' is not assignable to type 'number'

// Avant
const x: number = "123"

// Après
const x: number = parseInt("123", 10)
```

### Import - Module Not Found
```bash
# Vérifier si installé
npm ls [package]

# Installer si manquant
npm install [package]
```

### Config - Invalid tsconfig
```bash
# Valider la config
npx tsc --showConfig
```

## Règles

- ⛔ Pas de `// @ts-ignore` sauf cas documenté
- ⛔ Pas de `any` sauf exception justifiée
- ✅ Comprendre avant de fixer
- ✅ Vérifier après fix

## Output

```
🔧 Build Fix Report

## Erreur Détectée
- Type: [TypeScript|Import|Config|Syntax]
- Fichier: [path:ligne]
- Message: [error message]

## Cause
[Explication]

## Fix Appliqué
[Description + code modifié]

## Vérification
✅ Build successful
   ou
⚠️ Nouvelle erreur → continuer diagnostic
```

## Délégation

Pour une analyse approfondie : `@build-error-resolver`
