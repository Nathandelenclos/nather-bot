---
id: TASK-24
title: Migrations Prisma initiales (prisma migrate dev)
status: Done
assignee: []
created_date: '2026-06-02 17:27'
updated_date: '2026-06-02 18:18'
labels: []
dependencies: []
priority: high
ordinal: 24000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Décisions techniques

**Approche choisie** :
- Axe 1 : prisma migrate dev --name init (SQL versionné, committé)
- Axe 2 : prisma generate avec DATABASE_URL placeholder pour CI

**Alternatives envisagées** :
- db push rejeté (pas de traçabilité, interdit prod)
- Flyway rejeté (overkill)
- Service PG dans CI reporté à TASK-35

**Acceptance Criteria** :
- AC-1 : migration SQL générée avec 3 tables + contraintes + index
- AC-2 : prisma generate passe avec DATABASE_URL placeholder
- AC-3 : prisma migrate deploy est idempotent
- AC-4 : bot démarre après docker compose up (migrations auto)

**Fichiers impactés** :
- prisma/migrations/ (nouveau)
- .github/workflows/ci.yml (DATABASE_URL placeholder)

## Notes

[2026-06-02] /plan : skippé (besoin infra/config — validation par dry-run du SQL)
[2026-06-02] /build : démarrage
<!-- SECTION:DESCRIPTION:END -->
