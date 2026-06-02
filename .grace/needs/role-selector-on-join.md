---
slug: role-selector-on-join
date_creation: 2026-06-02
statut: ready-to-dev
backlog_task_id: TASK-39
---

# Sélection de rôles à l'arrivée d'un membre

## Comportement attendu

Quand un nouveau membre rejoint le serveur, le message de bienvenue inclut un menu de sélection multi-choix listant les rôles disponibles configurés par l'administrateur. Le membre sélectionne ses centres d'intérêt et les rôles Discord correspondants lui sont attribués immédiatement. Les rôles disponibles sont configurables par serveur via `/config role add/remove/list`.

## Acteur principal

Nouveau membre (sélection), administrateur (configuration des rôles disponibles).

## Contraintes métier

- Les rôles disponibles sont configurés par serveur et stockés en base de données (table dédiée `GuildRole`)
- Le sélecteur est un composant multi-choix attaché au **même message** que l'embed de bienvenue
- Le membre peut sélectionner **plusieurs rôles** simultanément
- Si aucun rôle n'est configuré pour le serveur, aucun sélecteur n'est affiché (embed de bienvenue seul)
- L'attribution d'un rôle déjà possédé est idempotente (pas d'erreur)
- Si un rôle configuré en BDD n'existe plus sur le serveur Discord (supprimé), il est ignoré silencieusement avec un log `warn`
- Le bot doit avoir la permission Discord `ManageRoles` et son rôle doit être hiérarchiquement supérieur aux rôles à attribuer
- La commande `/config role` est réservée aux membres avec la permission `ManageGuild` (guard existant)
- Le sélecteur expire après 15 minutes (comportement natif Discord) — passé ce délai, l'interaction échoue gracieusement

## User Stories

### US-1 : Sélection des centres d'intérêt à l'arrivée (P1)
**En tant que** nouveau membre rejoignant le serveur
**Je souhaite** voir un menu de sélection de rôles joint au message de bienvenue
**Afin de** rejoindre automatiquement les espaces qui m'intéressent sans chercher comment obtenir des rôles

### US-2 : Attribution automatique des rôles sélectionnés (P1)
**En tant que** nouveau membre
**Je souhaite** que les rôles que je sélectionne me soient attribués immédiatement
**Afin d'** accéder aux canaux correspondants sans intervention d'un modérateur

### US-3 : Configuration des rôles disponibles par un admin (P1)
**En tant qu'** administrateur du serveur
**Je souhaite** pouvoir ajouter, retirer et lister les rôles proposés aux nouveaux membres via `/config role`
**Afin de** contrôler quels rôles sont mis en avant à l'arrivée

### US-4 : Absence de sélecteur si aucun rôle configuré (P2)
**En tant qu'** administrateur n'ayant pas encore configuré de rôles
**Je souhaite** que le bot ne plante pas et affiche uniquement l'embed de bienvenue
**Afin de** pouvoir déployer le bot sans configuration préalable des rôles

### US-5 : Robustesse si un rôle est supprimé du serveur (P2)
**En tant que** système
**Je souhaite** ignorer silencieusement les rôles présents en BDD mais supprimés du serveur Discord
**Afin d'** éviter toute erreur visible par le membre lors de son arrivée

## Scenarios Given/When/Then

### Happy path — Membre sélectionne plusieurs rôles
- **Given** un serveur avec 3 rôles configurés (`Gamer`, `Dev`, `Musique`) dans la BDD
- **When** un nouveau membre rejoint
- **Then** le message de bienvenue est envoyé avec un `StringSelectMenu` multi-choix listé en dessous
- **And** le menu affiche les 3 options avec leur libellé (et emoji si configuré)
- **When** le membre sélectionne `Gamer` et `Dev`
- **Then** les 2 rôles Discord lui sont attribués immédiatement
- **And** le menu est mis à jour avec un message de confirmation `✅ Rôles attribués : Gamer, Dev`

### Configuration — Admin ajoute un rôle
- **Given** un administrateur avec la permission `ManageGuild`
- **When** il exécute `/config role add @Dev Développeur 💻`
- **Then** le rôle est enregistré en BDD avec son libellé et son emoji
- **And** le bot confirme l'ajout avec un embed éphémère

### Configuration — Admin retire un rôle
- **Given** un rôle `Dev` configuré en BDD
- **When** l'admin exécute `/config role remove @Dev`
- **Then** le rôle est retiré de la BDD
- **And** il n'apparaît plus dans le sélecteur des nouveaux membres

### Configuration — Admin liste les rôles configurés
- **Given** 2 rôles configurés pour le serveur
- **When** l'admin exécute `/config role list`
- **Then** le bot répond avec un embed éphémère listant les rôles avec leur libellé et emoji

### Cas limite — Aucun rôle configuré
- **Given** aucun rôle dans la BDD pour ce serveur
- **When** un nouveau membre rejoint
- **Then** seul l'embed de bienvenue est envoyé (pas de `StringSelectMenu`)
- **And** aucune erreur n'est émise

### Cas limite — Rôle supprimé de Discord mais présent en BDD
- **Given** un rôle `Gaming` en BDD mais le rôle Discord correspondant a été supprimé
- **When** le membre sélectionne `Gaming`
- **Then** le bot ignore ce rôle silencieusement
- **And** un log `warn` est émis : `"Role {roleId} not found on guild {guildId}, skipping"`
- **And** les autres rôles sélectionnés sont attribués normalement

### Cas limite — Membre ne répond pas (expiration)
- **Given** un sélecteur affiché après le message de bienvenue
- **When** le membre ne sélectionne rien et que 15 minutes passent
- **Then** le composant Discord est automatiquement désactivé (comportement natif)
- **And** aucun rôle n'est attribué — état neutre acceptable

## Tests métier à écrire

1. `test_role_select_menu_shown_when_roles_configured`
2. `test_no_role_menu_when_no_roles_configured`
3. `test_roles_assigned_after_member_selects`
4. `test_confirmation_message_after_selection`
5. `test_config_role_add_stores_role_in_db`
6. `test_config_role_remove_deletes_role_from_db`
7. `test_config_role_list_shows_configured_roles`
8. `test_config_role_requires_manage_guild`
9. `test_graceful_when_discord_role_deleted`
10. `test_idempotent_if_member_already_has_role`

## Glossaire métier

| Terme | Définition |
|---|---|
| Rôle disponible | Rôle Discord configuré par un admin pour être proposé aux nouveaux membres |
| `GuildRole` | Enregistrement BDD associant un `roleId` Discord à un serveur (`guildId`), un libellé et un emoji optionnel |
| Sélecteur de rôles | Composant Discord (`StringSelectMenu`) multi-choix affiché sous l'embed de bienvenue |
| Libellé | Nom affiché dans le sélecteur, distinct du nom du rôle Discord (ex : "Développeur" pour le rôle `@dev`) |
| Attribution | Action d'ajouter un rôle Discord à un membre via l'API Discord |

## Hors périmètre

- Modification des rôles d'un membre existant (hors arrivée)
- Commande `/roles` pour que les membres existants changent leurs rôles
- Rôles automatiques sans sélection (rôle `@everyone` compris)
- Limite du nombre de rôles sélectionnables (pas de min imposé)
- Rôles payants ou à accès conditionnel

## Implémentation

### Fichiers impactés

- `prisma/schema.prisma` — nouveau modèle `GuildRole`
- `prisma/migrations/` — migration add_guild_roles
- `src/domain/guild-role/` — entité `GuildRole`, port `IGuildRoleRepository` (nouveau bounded context)
- `src/application/guild-role/` — `AddGuildRoleUseCase`, `RemoveGuildRoleUseCase`, `ListGuildRolesUseCase`
- `src/infrastructure/persistence/guild-role/` — `GuildRolePrismaRepository`
- `src/interface/discord/commands/config.command.ts` — sous-commandes `role add/remove/list`
- `src/interface/discord/components/role-select.handler.ts` — handler `StringSelectMenu`
- `src/interface/discord/events/guild-member-add.event.ts` — ajout du sélecteur si rôles configurés
- `src/container.ts` — câblage

### PRs
(à remplir)

### Tests exécutés
(à remplir)

### Date de réalisation
(à remplir au merge)
