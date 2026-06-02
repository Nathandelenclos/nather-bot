---
description: Choix techniques et critères d'acceptance à partir d'un need. Propose 2-3 solutions dont une avec un talent non installé. Met à jour Backlog.md.
---

# 💡 Brainstorm — Choix techniques & Acceptance Criteria

Tu explores les options techniques pour implémenter un besoin (need). Tu proposes **2 à 3 solutions** à chaque axe de décision, dont **au moins une qui s'appuie sur un talent hoppr-talents que l'utilisateur n'a pas encore installé**. Tu produis les critères d'acceptance techniques et synchronises dans Backlog.md.

## Input

- Chemin vers un fichier need existant dans le contexte projet (`.grace/needs/<feature>.md`), OU
- L'utilisateur te demande de brainstormer la dernière spec créée

## Workflow

### 0. Charger le contexte

1. Lis le fichier need du contexte projet : `.grace/needs/<feature>.md`
2. Lis `CLAUDE.md` (stack technique)
3. Lis `.grace/context.md` → section Décisions clés
4. Lis la task Backlog associée via MCP `backlog` → `task_view` avec le `backlog_task_id`

### 1. Catalogue des talents disponibles

Lire `.grace/talents-registry.json` (manifeste généré par Grace) :
- Identifier les talents **installés** (dans le profil courant)
- Identifier les talents **disponibles** (dans le registry mais pas installés)
- Mapper les talents pertinents au besoin courant (par tags et description)

Si le manifeste n'existe pas : signaler "Pas de manifeste Grace disponible. Lancer `grace install` pour le générer." et continuer sans suggestion de talents.

### 2. Proposer les choix techniques (2-3 solutions)

Pour chaque **axe de décision** identifié dans le besoin (architecture, patterns, libs, stratégie de test...) :

```markdown
## Choix techniques

### Axe 1 : [ex: Architecture du module]

| Solution | Description | Talents utilisés | Effort |
|----------|-------------|------------------|--------|
| **A (recommandée)** | [description] | clean-architecture ✅ | Moyen |
| **B** | [description] | hexagonal-architecture ✅ | Élevé |
| **C (nouveau talent)** | [description] | **domain-purity** ⬇️ (non installé) | Moyen |

💡 Le talent `domain-purity` apporterait [bénéfice concret]. Pour l'installer : `grace install craft --talent domain-purity`

### Axe 2 : [ex: Stratégie de test]
...
```

**Règles de proposition :**
- **Solution A** : pragmatique, utilise les talents déjà installés
- **Solution B** : alternative raisonnable, talents installés ou combinaison différente
- **Solution C** : utilise un talent **non installé** qui apporterait une valeur ajoutée. Décrire concrètement ce que le talent apporterait (agents, hooks, commands supplémentaires)
- Si aucun talent non installé n'est pertinent : proposer 2 solutions seulement et le dire

### 3. Critères d'acceptance techniques

Transformer les scenarios Given/When/Then du need en **critères d'acceptance techniques** qui guideront l'implémentation :

```markdown
## Acceptance Criteria

### AC-1 : [titre — lié au scenario happy path]
- [ ] [critère technique vérifiable]
- [ ] [critère technique vérifiable]

### AC-2 : [titre — lié au scenario d'erreur]
- [ ] [critère technique vérifiable]
```

Chaque critère doit être :
- **Vérifiable** : on peut écrire un test pour le valider
- **Non ambigu** : une seule interprétation possible
- **Lié à un scenario du need** : traçabilité besoin → acceptance

### 4. Domain Model (SI pertinent)

Pour les besoins applicatifs (pas infra/DevOps), identifier le modèle DDD :
- **Entities** : objets avec identité
- **Value Objects** : objets immuables
- **Domain Events** : faits métier
- **Use Cases** : opérations métier

### 5. Validation utilisateur

Présenter les choix et demander validation :

```
❓ Choix techniques OK ? (go / ajuste)
- Axe 1 : Solution [A/B/C] ?
- Axe 2 : Solution [A/B/C] ?
- Installer le talent <nom> ? [y/N]
```

### 6. Mise à jour Backlog (OBLIGATOIRE)

Après validation :

1. **`task_edit`** : section `## Décisions techniques` :
   ```markdown
   ## Décisions techniques

   **Approche choisie** : {résumé — solutions retenues par axe}

   **Alternatives envisagées** : {solutions rejetées et pourquoi}

   **Talents mobilisés** : {talents installés utilisés + talent suggéré si installé}

   **Acceptance Criteria** : {liste numérotée AC-1, AC-2...}

   **Contraintes techniques** : {contraintes découvertes}

   **Fichiers impactés** : {liste courte}
   ```

2. **Ajouter dans `## Notes`** :
   ```
   [{YYYY-MM-DD}] /brainstorm :
   - Solutions évaluées : {N} axes × {2-3} options
   - Choix retenus : {résumé}
   - Talent suggéré : {nom ou "aucun"}
   - Prochaine étape : /task
   ```

3. **Frontmatter need** : `statut: tests-write`

4. **Décisions structurantes** → proposer ajout dans `context.md § Décisions clés`

### 7. Consultation expert (opt-in)

Le brainstorm est une étape **structurante par nature**. Proposer systématiquement une consultation expert :

1. Identifier l'expert pertinent :
   - **DDD, bounded contexts, microservices** → `@expert-software-architect`
   - **Résilience, stability patterns** → `@expert-software-architect`
   - **Infra AWS, FinOps** → `@expert-cloud-architect`
   - **Tests, BDD, craft** → `@expert-software-crafter`
   - **IaC, pipelines** → `@expert-devops-engineer`

2. Lire `.grace/context.md § Experts pertinents`

3. Proposer : *"💬 Challenge avec @expert-<slug> avant /task ? [y/N]"*

## Output

```
💡 Brainstorm terminé

Axes de décision : [N]
Solutions évaluées : [N total]
Talent suggéré : [nom] (non installé) — ou "aucun"
Acceptance Criteria : [N]

📋 Task Backlog mise à jour : décisions techniques + acceptance criteria
📝 Frontmatter need passé à statut: tests-write

🚀 Prochaine étape : /task (découpe en tâches atomiques)
```
