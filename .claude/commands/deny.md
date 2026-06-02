---
description: Renvoyer à une étape précédente du workflow quand la review échoue ou qu'un problème est détecté. Tracabilité complète dans le Backlog.
---

# ❌ Deny — Retour à une étape précédente

Tu renvoies le travail à une étape précédente du workflow quand un problème est détecté (review échouée, tests cassés, choix technique à revoir). Tu documentes le pourquoi et ce qui doit être corrigé.

## Input

- Le `/review` a échoué (verdict FAIL), OU
- L'utilisateur identifie un problème à n'importe quelle étape du workflow, OU
- Un reviewer externe (PR review) demande des modifications

## Workflow

### 1. Identifier l'étape cible

Proposer à l'utilisateur l'étape de retour :

```
❌ Deny — retour en arrière

Quel est le problème ?

1. 🔨 /build — tests cassés, bug d'implémentation → retour en implémentation
2. 🧪 /plan — tests manquants ou mal conçus → réécrire les tests
3. ✅ /task — découpe inadaptée, sous-tasks manquantes → redécouper
4. 💡 /brainstorm — choix technique erroné → revoir l'architecture
5. 📋 /need — spec incomplète ou incorrecte → revoir le besoin

Étape de retour ? (1-5)
```

### 2. Documenter le rejet

Demander à l'utilisateur (ou extraire du contexte) :
- **Raison** : pourquoi le retour est nécessaire
- **Problèmes identifiés** : liste concrète
- **Corrections attendues** : ce qui doit changer

### 3. Sync Backlog

Via MCP `backlog` → `task_edit` de l'issue parente :
1. Remettre le statut en "In Progress"
2. Ajouter dans `## Notes` :
   ```
   [{YYYY-MM-DD}] /deny : retour à /<étape>
   - Raison : {raison}
   - Problèmes : {liste}
   - Corrections attendues : {liste}
   ```

### 4. Sync need

Mettre à jour le frontmatter du need selon l'étape de retour :
- Retour `/build` → `statut: code-write`
- Retour `/plan` → `statut: tests-write`
- Retour `/task` → `statut: tests-write`
- Retour `/brainstorm` → `statut: ready-to-dev`
- Retour `/need` → `statut: ready-to-dev`

### 5. Prochaine action

```
🔄 Deny enregistré

Retour à : /<étape>
Raison : {raison}
Corrections : {liste courte}

📋 Backlog mis à jour
📝 Need statut : <nouveau statut>

🚀 Relance : /<étape> pour reprendre le workflow
```

## Règles

- **Toujours documenter** le pourquoi du deny — pas de retour silencieux
- **Ne pas supprimer** le travail fait — les commits restent, les tests restent
- **Le deny n'est pas un échec** — c'est un feedback loop normal
- **Pas de deny en boucle** — si le même problème revient 3 fois, proposer de remonter d'une étape supplémentaire

## Output

```
❌ Deny enregistré

Retour à : /<étape>
📋 Backlog : statut → In Progress, notes mises à jour
📝 Need : statut → <nouveau statut>

🚀 Relance : /<étape>
```
