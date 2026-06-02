---
id: TASK-27
title: Commande /help — liste des commandes disponibles
status: In Progress
assignee: []
created_date: '2026-06-02 17:27'
updated_date: '2026-06-02 19:17'
labels: []
dependencies: []
priority: high
ordinal: 27000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Décisions techniques

**Approche** : HelpCommand injecte CommandRegistry (registry.all())
**Format** : EmbedBuilder fields, couleur 0x5865f2, ephemeral: true
**Pas de BDD** : commande pure Interface layer

**AC** :
- AC-1 : constructeur(CommandRegistry) + embed depuis registry.all()
- AC-2 : ephemeral: true
- AC-3 : test unitaire avec mock CommandRegistry
- AC-4 : enregistrée dans container.ts + deploy-commands.ts

**Fichiers** :
- src/interface/discord/commands/help.command.ts (nouveau)
- src/interface/discord/commands/help.command.test.ts (nouveau)
- src/container.ts (ajout HelpCommand)
- src/interface/scripts/deploy-commands.ts (ajout)

## Notes
[2026-06-02] /pick + /brainstorm : injection CommandRegistry, EmbedBuilder
[2026-06-02] /plan : tests écrits (RED attendu)
<!-- SECTION:DESCRIPTION:END -->
