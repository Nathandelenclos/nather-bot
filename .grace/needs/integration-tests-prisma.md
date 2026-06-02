# Need — Tests d'intégration Prisma repositories

**Backlog** : TASK-25 · **Priorité** : High · **Statut** : In Progress
**Dépend de** : TASK-24 (migration initiale ✅)

## Contexte

Les repositories Prisma (`GuildConfigPrismaRepository`, `UserProfilePrismaRepository`, `CommandLogPrismaRepository`) sont implémentés mais uniquement testés via des mocks dans les use cases. Aucun test ne vérifie le mapping domain ↔ BDD, les contraintes SQL, l'idempotence des upserts ou les requêtes réelles.

L'infrastructure de test est déjà en place (`docker-compose.test.yml`, `src/infrastructure/persistence/prisma/test-setup.ts`).

## User Stories

- **P1** En tant que développeur, je veux des tests d'intégration sur chaque repository afin d'avoir confiance que le mapping domain ↔ Prisma est correct et que les contraintes SQL sont respectées.
- **P1** En tant que développeur, je veux que ces tests tournent sur une vraie BDD PostgreSQL (via Docker) afin d'éviter les divergences mock/prod.

## Acceptance Criteria

```gherkin
# GuildConfigRepository
Given une BDD vide
When j'appelle upsert avec un GuildConfig valide
Then le record est créé en base
And findByGuildId retourne l'entité reconstituée avec les bons VOs

Given un GuildConfig existant
When j'appelle upsert avec un nouveau prefix
Then le record est mis à jour (pas de doublon)
And updatedAt est rafraîchi

Given un guildId inexistant
When j'appelle findByGuildId
Then null est retourné

# UserProfileRepository
Given une BDD vide
When j'appelle upsert avec un UserProfile (0 points)
Then le record est créé avec la clé composée (userId, guildId)

Given un UserProfile existant avec 10 points
When j'appelle upsert avec 25 points
Then le record est mis à jour (points = 25)

Given un (userId, guildId) inexistant
When j'appelle findByUserAndGuild
Then null est retourné

# CommandLogRepository
Given une BDD vide
When j'appelle save avec un CommandLog
Then le record est persisté avec id UUID, executedAt, commandName

Given 5 logs pour un guild, 2 pour un autre
When j'appelle findByGuild avec limit=3
Then 3 logs du bon guild sont retournés, triés par executedAt DESC
```

## Contraintes

- Tests sur vraie BDD PostgreSQL via `docker-compose.test.yml` (port 5433)
- Isolation : chaque test nettoie ses données (`afterEach` truncate ou delete)
- `migrate deploy` appliqué une seule fois au globalSetup
- Les tests doivent passer sans modifier le code des repositories
- Pas de mock Prisma

## Tests à écrire

- `src/infrastructure/persistence/guild/guild-config.prisma-repository.integration.test.ts`
- `src/infrastructure/persistence/user/user-profile.prisma-repository.integration.test.ts`
- `src/infrastructure/persistence/command-log/command-log.prisma-repository.integration.test.ts`
