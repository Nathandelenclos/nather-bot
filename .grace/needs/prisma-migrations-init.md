# Need — Migrations Prisma initiales

**Backlog** : TASK-24 · **Priorité** : High · **Statut** : In Progress

## Contexte

Le schéma Prisma est défini (`prisma/schema.prisma`) avec trois modèles : `GuildConfig`, `UserProfile`, `CommandLog`. Aucune migration n'a encore été générée. Sans migration, le bot ne peut pas démarrer car les tables n'existent pas en base.

## User Stories

- **P1** En tant que développeur, je veux générer la migration initiale afin que la BDD soit provisionnée au premier `docker compose up`.
- **P1** En tant qu'opérateur, je veux que les migrations soient appliquées automatiquement au démarrage du bot en prod afin de ne pas avoir d'étape manuelle.

## Acceptance Criteria

```gherkin
Given le schéma Prisma est défini avec GuildConfig, UserProfile, CommandLog
When je lance `prisma migrate dev --name init`
Then un fichier de migration SQL est généré dans prisma/migrations/
And les trois tables sont créées en base avec les bons types et contraintes
And le client Prisma est régénéré

Given le docker-compose.yml lance `prisma migrate deploy` avant `node dist/main.js`
When le bot démarre en prod
Then les migrations sont appliquées sans intervention manuelle
And si les migrations sont déjà appliquées, aucune erreur n'est levée (idempotent)

Given la migration initiale est commitée
When le CI lint/test/build tourne
Then `prisma generate` s'exécute sans DATABASE_URL réelle (placeholder)
And les tests unitaires passent toujours (7/7)
```

## Contraintes

- Ne pas utiliser `prisma db push` en prod — uniquement `migrate deploy`
- La migration doit être commitée dans le repo (pas ignorée)
- Le `prisma generate` doit fonctionner avec une DATABASE_URL placeholder pour le CI

## Tests à écrire

- Vérification que les fichiers de migration existent (`prisma/migrations/*/migration.sql`)
- Tests d'intégration repositories (TASK-25, dépend de cette tâche)
