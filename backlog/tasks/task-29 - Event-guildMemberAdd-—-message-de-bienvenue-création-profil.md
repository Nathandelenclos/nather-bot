---
id: TASK-29
title: Message de bienvenue embed à l'arrivée d'un membre
status: Done
assignee: []
created_date: '2026-06-02 17:27'
updated_date: '2026-06-02 21:04'
labels: []
dependencies: []
priority: medium
ordinal: 29000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Spec complète : `.grace/needs/welcome-message.md`

## Décisions techniques

**Axe 1** : welcomeChannelId String? sur GuildConfig (champ nullable)
**Axe 2** : ComponentRegistry + WelcomeChannelSelectHandler dispatché depuis InteractionCreateEvent
**Axe 3** : Math.random() * 0xFFFFFF pour la couleur
**Axe 4** : UpdateWelcomeChannelUseCase (pattern identique à UpsertGuildConfigUseCase)

## AC
- AC-1 : GuildConfig.welcomeChannelId? + setWelcomeChannel()
- AC-2 : Migration Prisma add_welcome_channel
- AC-3 : UpdateWelcomeChannelUseCase
- AC-4 : /config welcome-channel → ChannelSelectMenuBuilder (customId: welcome-channel-select)
- AC-5 : ComponentRegistry + WelcomeChannelSelectHandler
- AC-6 : GuildMemberAddEvent — embed couleur random, footer date+heure, graceful si null
- AC-7 : GetOrCreateUserProfileUseCase appelé à l'arrivée
- AC-8 : Graceful DiscordAPIError (SendMessages manquant)

## Fichiers impactés
- prisma/schema.prisma + migration
- src/domain/guild/entities/guild-config.entity.ts
- src/application/guild/use-cases/update-welcome-channel.use-case.ts (nouveau)
- src/interface/discord/commands/config.command.ts (sous-commande welcome-channel)
- src/interface/discord/components/ (nouveau dossier)
- src/interface/discord/events/guild-member-add.event.ts (nouveau)
- src/container.ts

## Notes
[2026-06-02] /pick + /brainstorm : decisions validées
<!-- SECTION:DESCRIPTION:END -->
