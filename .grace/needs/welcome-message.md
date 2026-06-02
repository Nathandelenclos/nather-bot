---
slug: welcome-message
date_creation: 2026-06-02
statut: ready-to-dev
backlog_task_id: TASK-29
---

# Message de bienvenue embed à l'arrivée d'un membre

## Comportement attendu

Quand un nouveau membre rejoint le serveur, le bot envoie automatiquement un embed de bienvenue dans le canal configuré. L'embed affiche l'avatar du membre, son nom, le numéro du membre dans le serveur, une couleur générée aléatoirement, et un footer horodaté. Le canal de bienvenue est sélectionné par un administrateur via une interface Discord native (ChannelSelectMenu), sans saisie texte.

## Acteur principal

Nouveau membre (déclencheur), administrateur (configuration).

## Contraintes métier

- La couleur de l'embed est générée aléatoirement à chaque arrivée (entier RGB compris entre 0x000000 et 0xFFFFFF)
- Le footer affiche la date et l'heure d'arrivée au format `DD/MM/YYYY à HH:MM`
- Si aucun canal n'est configuré : rien n'est envoyé, une ligne de log `info` est émise — pas de crash
- Si le bot n'a pas la permission `SendMessages` dans le canal configuré : log `warn`, pas de crash
- La sélection du canal passe par un `ChannelSelectMenuBuilder` Discord (interaction de type composant)
- Le `welcomeChannelId` est stocké dans `GuildConfig` (champ nullable)
- L'arrivée d'un membre crée automatiquement son `UserProfile` en base (0 points) via `GetOrCreateUserProfileUseCase`
- Seuls les canaux de type `GuildText` sont acceptables pour l'envoi

## User Stories

### US-1 : Accueil visuel du nouveau membre (P1)
**En tant que** nouveau membre rejoignant le serveur
**Je souhaite** voir un message de bienvenue visuel dans un canal dédié
**Afin de** me sentir accueilli et identifier le bot comme présent sur le serveur

### US-2 : Configuration du canal via sélecteur Discord (P1)
**En tant qu'** administrateur
**Je souhaite** configurer le canal de bienvenue en sélectionnant un canal depuis un menu Discord natif
**Afin de** choisir précisément où apparaissent les messages sans risque de faute de frappe

### US-3 : Robustesse en l'absence de configuration (P2)
**En tant qu'** administrateur n'ayant pas encore configuré le canal
**Je souhaite** que le bot ne plante pas et ne pollue pas le serveur
**Afin de** pouvoir déployer le bot sans configuration immédiate

### US-4 : Création automatique du profil utilisateur (P2)
**En tant que** système
**Je souhaite** créer le `UserProfile` du membre à son arrivée
**Afin qu'** il soit prêt à accumuler des points dès sa première interaction

## Scenarios Given/When/Then

### Happy path — Canal configuré, membre accueilli
- **Given** un serveur avec `welcomeChannelId` configuré dans `GuildConfig`
- **When** un nouveau membre rejoint le serveur
- **Then** le bot envoie un embed dans le canal configuré
- **And** l'embed contient l'avatar du membre, son mention, et le numéro de membre
- **And** la couleur de l'embed est un entier aléatoire entre 0x000000 et 0xFFFFFF
- **And** le footer affiche la date et l'heure au format `DD/MM/YYYY à HH:MM`
- **And** un `UserProfile` est créé en base avec 0 points

### Configuration du canal — Sélecteur UI
- **Given** un administrateur avec la permission `ManageGuild`
- **When** il exécute `/config welcome-channel`
- **Then** le bot répond avec un message éphémère contenant un `ChannelSelectMenuBuilder`
- **When** l'administrateur sélectionne un canal dans le menu
- **Then** le bot confirme avec le nom du canal sélectionné
- **And** `welcomeChannelId` est sauvegardé dans `GuildConfig`

### Cas d'erreur — Aucun canal configuré
- **Given** un serveur sans `welcomeChannelId` (`null`)
- **When** un nouveau membre rejoint
- **Then** aucun message n'est envoyé
- **And** une ligne de log `info` est émise : `"No welcome channel configured for guild {guildId}"`

### Cas d'erreur — Bot sans permission d'écrire
- **Given** un `welcomeChannelId` configuré mais le bot n'a pas `SendMessages` dans ce canal
- **When** un nouveau membre rejoint
- **Then** aucun message n'est envoyé
- **And** une ligne de log `warn` est émise : `"Cannot send welcome message in channel {channelId}"`

### Cas limite — Canal supprimé depuis la configuration
- **Given** un `welcomeChannelId` stocké mais le canal a été supprimé du serveur
- **When** un nouveau membre rejoint
- **Then** la résolution du canal retourne `null` — traité comme le cas "bot sans permission"
- **And** log `warn`

## Tests métier à écrire

1. `test_welcome_embed_sent_when_channel_configured`
2. `test_welcome_embed_has_random_color`
3. `test_welcome_embed_footer_has_date_and_time`
4. `test_no_message_when_no_channel_configured`
5. `test_user_profile_created_on_member_join`
6. `test_config_welcome_channel_stores_channel_id`
7. `test_config_welcome_channel_requires_manage_guild`
8. `test_graceful_when_bot_lacks_send_permission`

## Glossaire métier

| Terme | Définition |
|---|---|
| Canal de bienvenue | Canal `GuildText` Discord où sont envoyés les embeds d'arrivée |
| ChannelSelectMenu | Composant Discord natif (v14) permettant de sélectionner un canal dans une liste |
| Embed de bienvenue | Message Discord enrichi avec avatar, mention, couleur aléatoire, footer horodaté |
| `welcomeChannelId` | Snowflake Discord du canal configuré, stocké dans `GuildConfig`, nullable |
| UserProfile | Entité domaine représentant un membre sur un serveur, créée à l'arrivée |

## Hors périmètre

- Message de départ (au revoir)
- Message privé (DM) au nouveau membre
- Attribution automatique de rôle à l'arrivée
- Personnalisation du texte de bienvenue (message fixe pour l'instant)
- Prévisualisation de l'embed avant configuration

## Implémentation

### Fichiers impactés

- `prisma/schema.prisma` — ajout `welcomeChannelId String?` sur `GuildConfig`
- `prisma/migrations/` — nouvelle migration
- `src/domain/guild/entities/guild-config.entity.ts` — ajout champ + mutateur
- `src/application/guild/` — `UpdateWelcomeChannelUseCase`
- `src/interface/discord/commands/config.command.ts` — sous-commande `welcome-channel` + ChannelSelectMenu handler
- `src/interface/discord/events/guild-member-add.event.ts` — nouveau
- `src/container.ts` — câblage

### PRs
(à remplir)

### Tests exécutés
(à remplir)

### Date de réalisation
(à remplir au merge)
