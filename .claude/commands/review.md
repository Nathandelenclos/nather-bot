---
description: Vérification finale — tests automatiques au vert + simulation de tests manuels sur ce qui a été développé. Dernière ligne de défense avant la PR.
---

# 🔍 Review — Vérification finale

Tu es la dernière ligne de défense avant la PR. Tu vérifies que **tous les tests passent au vert**, puis tu **simules des tests manuels** sur ce qui a été développé pour repérer ce que les tests automatisés ne couvrent pas.

## Input

- Le `/build` est terminé (tous les tests GREEN, commits créés), OU
- L'utilisateur demande une review d'une task Backlog spécifique

## Workflow

### 1. Vérifier les prérequis

**NE JAMAIS démarrer** sans :
1. `@builder` a terminé (toutes les sous-tasks `[impl]` en "Done")
2. Le fichier need du contexte projet existe : `.grace/needs/<feature>.md`

### 2. Phase 1 — Tests automatisés (bloquants)

Exécuter dans l'ordre, chaque étape doit passer avant la suivante :

#### 2.1 Tests d'architecture
Lancer la cible d'archi spécifique (ArchUnit, dependency-cruiser, go-arch-lint, import-linter).
- Si FAIL → **bloquer**. Lister les violations et renvoyer à `/build` pour correction.

#### 2.2 Tests BDD
Lancer les scenarios Cucumber/Gherkin.
- Si FAIL → **bloquer**. Identifier le scenario en échec et renvoyer à `/build`.

#### 2.3 Tests unitaires
Lancer la suite complète (pas juste les tests du need — chercher les régressions).
- Si FAIL → **bloquer**. Identifier la régression.

#### 2.4 Lint
Lancer le linter (depuis `CLAUDE.md` → commande lint).
- Si FAIL → corriger automatiquement si possible (autofix), sinon signaler.

### 3. Phase 2 — Tests manuels simulés (si pertinent)

**Quand simuler des tests manuels** :
- Le need implique une **UI** ou une **interaction utilisateur** visible
- Le need implique une **CLI** avec une sortie formatée
- Le need implique une **API** avec des réponses structurées
- Le besoin a des **edge cases visuels** ou **UX** non couverts par les tests auto

**Quand NE PAS simuler** :
- Besoin purement algorithmique/domain (déjà couvert par les tests)
- Besoin infra/devops (pas d'interface à tester manuellement)
- Refactoring (pas de changement de comportement observable)

**Comment simuler** :
Pour chaque scenario du need, vérifier manuellement :
1. **Lancer la commande / appeler l'API / naviguer l'UI** et observer le résultat
2. **Comparer avec le Then du scenario** — le résultat correspond-il exactement ?
3. **Tester les cas limites** non couverts par les scenarios :
   - Données vides / nulles
   - Données très longues
   - Caractères spéciaux / unicode
   - Permissions insuffisantes
   - Concurrence (si applicable)

### 4. Phase 3 — Rapport de review

```markdown
## Review Report — <feature>

### Tests automatisés
| Suite | Résultat | Détails |
|-------|----------|---------|
| Architecture | ✅ PASS | [N] règles, 0 violation |
| BDD | ✅ PASS | [N] scenarios, [M] steps |
| Unit | ✅ PASS | [N] tests, 0 régression |
| Lint | ✅ PASS | 0 warning |

### Tests manuels (si réalisés)
| Test | Résultat | Notes |
|------|----------|-------|
| Happy path — [scenario] | ✅ | [observation] |
| Edge case — données vides | ✅ | [observation] |
| Edge case — unicode | ⚠️ | [problème détecté] |

### Verdict
- ✅ **PASS** — prêt pour `/accept` (création de la PR)
- ❌ **FAIL** — corrections nécessaires, renvoyer à `/build`
- ⚠️ **PASS avec réserves** — mineur, acceptable pour la PR avec un TODO
```

### 5. Sync Backlog (OBLIGATOIRE)

Via MCP `backlog` → `task_edit` de l'issue parente :
1. Si PASS : passer en "In Review"
2. Ajouter dans `## Notes` :
   ```
   [{YYYY-MM-DD}] /review :
   - Tests auto : [N] GREEN (archi + BDD + unit)
   - Tests manuels : [N] réalisés, [M] OK
   - Verdict : PASS / FAIL / PASS avec réserves
   - Prochaine étape : /accept ou /deny
   ```

3. Mettre à jour le frontmatter du need : `statut: qa-ok` (si PASS)

### 6. Décision

Si **PASS** ou **PASS avec réserves** :
```
✅ Review terminée — prêt pour la PR

🚀 /accept pour créer la PR
```

Si **FAIL** :
```
❌ Review échouée — corrections nécessaires

{liste des problèmes}

🔄 /deny pour renvoyer à /build avec les corrections
```

## Output

```
🔍 Review terminée

✅ Tests auto : [N] GREEN
🧪 Tests manuels : [N] réalisés (si applicable)
📋 Verdict : PASS / FAIL

📋 Task Backlog : statut → In Review
📝 Frontmatter need : statut → qa-ok

🚀 Prochaine étape : /accept (créer la PR) ou /deny (retour en /build)
```
