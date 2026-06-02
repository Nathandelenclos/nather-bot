# Contexte projet — Discord Bot (Nather)

## Objectif

Bot Discord TypeScript personnel, architecture hexagonale (DDD), déployé sur Dokploy.
Sert de vitrine technique et de bot utilitaire pour des serveurs Discord personnels.

## Stack

- discord.js v14 · TypeScript ESM · pnpm 11
- PostgreSQL 16 + Prisma ORM
- Architecture hexagonale : Domain / Application / Infrastructure / Interface
- Monitoring : Prometheus + Grafana
- CI : GitHub Actions · Déploiement : Dokploy (Traefik)

## Décisions clés

- 2026-06-02 : Result<T, E> à la Rust — pas d'exceptions pour les erreurs domaine
- 2026-06-02 : Composition root manuel (container.ts) — pas de framework IoC
- 2026-06-02 : Serveur metrics HTTP séparé du Discord client (port 9090)
- 2026-06-02 : Tests d'intégration sur vraie BDD (docker-compose.test.yml), pas de mocks Prisma
- 2026-06-02 : docker-compose adapté Dokploy — réseau dokploy-network externe, Traefik labels sur Grafana

## État actuel

- 2026-06-02 : Initialisation complète du projet — 8 commits, 23 tâches done, architecture hexagonale en place
- 2026-06-02 : Profil grace craft importé (14 commandes, 9 agents TDD/DDD)
- 2026-06-02 : reprise issue "Migrations Prisma initiales" (TASK-24) → /brainstorm
- 2026-06-02 : TASK-24 Done — QA PASSED. Migration SQL initiale (3 tables), migration_lock.toml, dependency-cruiser (4 règles archi hexagonale). Tests : 7/7 vitest, 0 violation depcruise, 0 erreur biome. prisma generate OK avec placeholder DATABASE_URL. docker-compose.yml ligne 14 : migrate deploy avant node dist/main.js.
