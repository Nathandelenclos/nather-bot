# Discord Bot

Bot Discord TypeScript avec architecture hexagonale, monitoring Prometheus/Grafana et déploiement Dokploy.

## Stack

| Couche | Technologie |
|---|---|
| Discord | discord.js v14 |
| Base de données | PostgreSQL 16 + Prisma |
| Tests | Vitest |
| Lint / Format | Biome |
| Logging | Pino |
| Métriques | prom-client + Prometheus + Grafana |
| Infra | Docker + docker-compose |
| CI | GitHub Actions |

## Architecture

```
src/
├── domain/          # Entités, Value Objects, ports — zéro dépendances externes
│   ├── shared/      # Entity, ValueObject, DomainError, Result<T>
│   ├── guild/       # GuildConfig, GuildId, Prefix
│   ├── user/        # UserProfile, UserId, Points
│   ├── command-log/ # CommandLog, CommandName
│   └── ports/       # ILogger, IMetrics
├── application/     # Use cases
├── infrastructure/  # Prisma, Pino, Prometheus, Discord.js
├── interface/       # Commandes slash, events Discord
├── container.ts     # Composition root (câblage des dépendances)
└── main.ts          # Entry point
```

**Règle de dépendance** : tout pointe vers le domain. Le domain ne connaît rien d'externe.

## Démarrage rapide

### Prérequis

- Node.js 22+
- pnpm 11+
- Docker + Docker Compose

### Installation

```bash
pnpm install
# pnpm 11 bloque les build scripts par défaut
pnpm approve-builds    # approuver Prisma, Biome, esbuild
```

### Configuration

```bash
cp .env.example .env
# Remplir DISCORD_TOKEN, DISCORD_CLIENT_ID, POSTGRES_PASSWORD, etc.
```

### Développement

```bash
# Démarrer la base de données
docker compose up postgres -d

# Appliquer les migrations
pnpm db:migrate

# Générer le client Prisma
pnpm db:generate

# Enregistrer les slash commands (guild uniquement si DISCORD_GUILD_ID défini)
pnpm deploy:commands

# Démarrer le bot avec hot reload
pnpm dev
```

### Production (Docker)

```bash
docker compose up -d
```

Lance : bot + PostgreSQL + Prometheus + Grafana.

| Service | URL |
|---|---|
| Grafana | `https://$GRAFANA_DOMAIN` (via Traefik) |
| Prometheus | interne uniquement |
| Métriques bot | `bot:9090/metrics` (interne) |

## Commandes disponibles

| Commande | Description |
|---|---|
| `/ping` | Répond Pong! avec la latence |
| `/config prefix <value>` | Change le préfixe du serveur |

## Commandes pnpm

```bash
pnpm dev              # Dev avec hot reload
pnpm build            # Build TypeScript
pnpm start            # Démarrer depuis dist/
pnpm test             # Tests unitaires
pnpm test:coverage    # Couverture de code
pnpm lint             # Biome check
pnpm format           # Biome format
pnpm db:migrate       # Migrations Prisma (dev)
pnpm db:migrate:deploy# Migrations Prisma (prod)
pnpm db:generate      # Générer client Prisma
pnpm db:seed          # Seed de dev
pnpm deploy:commands  # Enregistrer slash commands
```

## Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `DISCORD_TOKEN` | Oui | Token du bot Discord |
| `DISCORD_CLIENT_ID` | Oui | ID de l'application Discord |
| `DISCORD_GUILD_ID` | Non | ID du serveur pour deploy guild-only |
| `POSTGRES_PASSWORD` | Oui | Mot de passe PostgreSQL |
| `GRAFANA_PASSWORD` | Oui | Mot de passe admin Grafana |
| `GRAFANA_DOMAIN` | Oui | Domaine public pour Grafana |
| `LOG_LEVEL` | Non | Niveau de log (défaut: `info`) |
| `NODE_ENV` | Non | Environnement (défaut: `development`) |

## Monitoring

Dashboard Grafana pré-configuré avec :
- Commandes exécutées par minute (par commande)
- Latence p95 des commandes
- Nombre de guilds actifs
- Taux d'erreurs
- Heap Node.js et event loop lag

## CI/CD

| Workflow | Déclencheur | Jobs |
|---|---|---|
| `ci.yml` | push/PR sur `main` | lint → test → build |
| `deploy-commands.yml` | Manuel (workflow_dispatch) | Deploy global ou guild |

## Déploiement Dokploy

Le `docker-compose.yml` est prêt pour Dokploy :
- Grafana exposé via Traefik (HTTPS automatique)
- Réseau `dokploy-network` externe déclaré
- Migrations Prisma appliquées au démarrage du bot
- Variables d'environnement à configurer dans l'UI Dokploy

## Backlog

Géré avec [Backlog.md](https://backlog.md) — voir `backlog/tasks/`.

```bash
backlog board          # Vue kanban
backlog task list      # Liste des tâches
```
