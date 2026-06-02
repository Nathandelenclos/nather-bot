---
id: TASK-39
title: Sélection de rôles à l'arrivée d'un membre
status: To Do
assignee: []
created_date: '2026-06-02 21:32'
labels: []
dependencies: []
priority: medium
ordinal: 39000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Spec complète : `.grace/needs/role-selector-on-join.md`

## Comportement attendu
Quand un membre rejoint, le message de bienvenue inclut un StringSelectMenu multi-choix listant les rôles configurés par l'admin. La sélection attribue les rôles Discord immédiatement. Rôles configurables par serveur via `/config role add/remove/list`.

## User Stories
- **US-1 (P1)** : En tant que nouveau membre, je veux un sélecteur de rôles joint au message de bienvenue
- **US-2 (P1)** : En tant que nouveau membre, je veux que mes rôles sélectionnés me soient attribués immédiatement
- **US-3 (P1)** : En tant qu'admin, je veux configurer les rôles disponibles via /config role add/remove/list
- **US-4 (P2)** : Si aucun rôle configuré → embed de bienvenue seul, pas d'erreur
- **US-5 (P2)** : Si un rôle supprimé de Discord → ignoré silencieusement avec log warn

## Contraintes métier
- Sélection multiple (StringSelectMenu multi-choix)
- Sélecteur attaché au même message que l'embed de bienvenue
- Nouveau modèle GuildRole en BDD (guildId, roleId, label, emoji?)
- Expiration native Discord 15 min — pas de gestion custom
- Requiert permission ManageRoles pour le bot
- /config role restreint à ManageGuild (guard existant)

## Dépendances
- TASK-29 ✅ (GuildMemberAddEvent, ComponentRegistry déjà en place)
- TASK-26 ✅ (permission guard ManageGuild)

## Tests à écrire
1. test_role_select_menu_shown_when_roles_configured
2. test_no_role_menu_when_no_roles_configured
3. test_roles_assigned_after_member_selects
4. test_confirmation_message_after_selection
5. test_config_role_add_stores_role_in_db
6. test_config_role_remove_deletes_role_from_db
7. test_config_role_list_shows_configured_roles
8. test_config_role_requires_manage_guild
9. test_graceful_when_discord_role_deleted
10. test_idempotent_if_member_already_has_role

## Notes
[2026-06-02] /need : spec créée
<!-- SECTION:DESCRIPTION:END -->
