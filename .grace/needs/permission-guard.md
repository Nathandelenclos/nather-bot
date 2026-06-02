# Need — Système de permissions / guard de commandes

**Backlog** : TASK-26 · **Priorité** : High · **Statut** : Done

## Contexte

La commande `/config prefix` modifie la configuration du serveur. N'importe quel membre peut actuellement l'exécuter. Il faut un mécanisme de guard pour restreindre certaines commandes aux membres ayant les permissions Discord requises (ex: `ManageGuild` pour `/config`).

## User Stories

- **P1** En tant qu'administrateur, je veux que `/config` soit réservé aux membres ayant la permission `ManageGuild` afin que n'importe quel membre ne puisse pas changer la configuration.
- **P1** En tant qu'utilisateur sans permission, je veux recevoir un message d'erreur clair et éphémère si j'essaie d'exécuter une commande restreinte.
- **P2** En tant que développeur, je veux un guard réutilisable afin de pouvoir restreindre facilement n'importe quelle future commande sans dupliquer la logique.

## Acceptance Criteria

```gherkin
Scenario: Commande admin exécutée par un non-admin
  Given un membre sans permission ManageGuild
  When il exécute /config prefix !
  Then le bot répond avec un message éphémère "Vous n'avez pas les permissions requises."
  And la commande n'est pas exécutée

Scenario: Commande admin exécutée par un admin
  Given un membre avec la permission ManageGuild
  When il exécute /config prefix !
  Then la commande s'exécute normalement

Scenario: Commande sans restriction exécutée par n'importe qui
  Given un membre sans aucune permission spéciale
  When il exécute /ping ou /help
  Then la commande s'exécute normalement (pas de vérification de permission)

Scenario: Guard réutilisable déclaré sur la commande
  Given une commande qui déclare requiredPermissions: [PermissionFlagsBits.ManageGuild]
  When le guard est évalué
  Then il vérifie interaction.memberPermissions
  And retourne false + répond si la permission manque
```

## Contraintes

- Le guard est une fonction pure (ou un décorateur de commande) dans `src/interface/discord/`
- Aucune dépendance BDD ni use case — pure Interface layer
- `requiredPermissions` déclaré au niveau de la commande (propriété optionnelle sur `IDiscordCommand`)
- Vérifié dans `InteractionCreateEvent.execute()` avant d'appeler `command.execute()`
- Message d'erreur : `"Vous n'avez pas les permissions requises pour cette commande."` éphémère

## Fichiers impactés

- `src/interface/discord/commands/base.command.ts` (ajout `requiredPermissions?`)
- `src/interface/discord/commands/config.command.ts` (déclare `ManageGuild`)
- `src/interface/discord/events/interaction-create.event.ts` (vérifie le guard avant execute)
- `src/interface/discord/guards/permission.guard.ts` (nouveau — logique pure)
- `src/interface/discord/guards/permission.guard.test.ts` (nouveau — tests unitaires)
