---
id: TASK-25
title: Tests d'intégration — Prisma repositories sur vraie BDD
status: Done
assignee: []
created_date: '2026-06-02 17:27'
updated_date: '2026-06-02 18:35'
labels: []
dependencies: []
priority: high
ordinal: 25000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Décisions techniques

**Approche** : Vitest + docker-compose.test.yml + globalSetup déjà en place
**Isolation** : deleteMany afterEach (ordre FK)
**Pattern fichiers** : *.integration.test.ts séparés des unit tests

**AC** :
- AC-1 : PrismaClient avec DATABASE_URL test dans beforeAll
- AC-2 : afterEach nettoie dans l'ordre FK
- AC-3 : 9 scenarios (3 par repo)
- AC-4 : pattern distinct des unit tests

**Fichiers** :
- src/infrastructure/persistence/guild/guild-config.prisma-repository.integration.test.ts
- src/infrastructure/persistence/user/user-profile.prisma-repository.integration.test.ts
- src/infrastructure/persistence/command-log/command-log.prisma-repository.integration.test.ts

## Notes
[2026-06-02] /pick : démarrage
[2026-06-02] /brainstorm : Vitest + docker-compose.test.yml, deleteMany afterEach
[2026-06-02] /plan : tests d'intégration à écrire (RED sur BDD vide)
[2026-06-02] /qa PASSED — 9/9 tests intégration verts, 7/7 unit tests verts, 0 violation depcruise, 0 erreur biome. Findings mineurs documentés (pas bloquants) : TEST_DB_URL dupliqué dans 3 fichiers (refactorable en shared constant), pas d'afterAll $disconnect (non bloquant avec singleFork), sorting test sur executedAt potentiellement flaky si insertions < 1ms d'écart (passe en pratique). TASK-25 → Done.
<!-- SECTION:DESCRIPTION:END -->
