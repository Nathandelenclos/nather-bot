---
id: TASK-26
title: Système de permissions/rôles Discord (middleware guard)
status: Done
assignee: []
created_date: '2026-06-02 17:27'
updated_date: '2026-06-02 19:30'
labels: []
dependencies: []
priority: high
ordinal: 26000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Décisions techniques

**Approche** : requiredPermissions sur IDiscordCommand + checkPermission() dans permission.guard.ts
**Vérification** : InteractionCreateEvent avant execute()
**Pas de BDD** : pure Interface layer

**AC** :
- AC-1 : IDiscordCommand.requiredPermissions?: bigint[]
- AC-2 : checkPermission(interaction, permissions) → boolean (fonction pure)
- AC-3 : InteractionCreateEvent vérifie avant execute, répond éphémère si false
- AC-4 : ConfigCommand déclare ManageGuild
- AC-5 : PingCommand/HelpCommand sans requiredPermissions → pas de check

**Fichiers** :
- src/interface/discord/guards/permission.guard.ts (nouveau)
- src/interface/discord/guards/permission.guard.test.ts (nouveau)
- src/interface/discord/commands/base.command.ts (requiredPermissions?)
- src/interface/discord/commands/config.command.ts (ManageGuild)
- src/interface/discord/events/interaction-create.event.ts (check guard)

## Notes
[2026-06-02] /pick + /brainstorm : checkPermission() pure + InteractionCreateEvent
[2026-06-02] /plan : tests écrits RED
<!-- SECTION:DESCRIPTION:END -->
