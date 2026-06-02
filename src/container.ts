import { LogCommandUseCase } from './application/command-log/index.js';
import { GetGuildConfigUseCase } from './application/guild/index.js';
import { UpsertGuildConfigUseCase } from './application/guild/index.js';
import { AddPointsUseCase, GetOrCreateUserProfileUseCase } from './application/user/index.js';
import { config } from './infrastructure/config/env.js';
import { createDiscordClient } from './infrastructure/discord/discord.client.js';
import { createPinoLogger } from './infrastructure/logging/pino.logger.js';
import { PrometheusMetrics } from './infrastructure/metrics/prometheus.metrics.js';
import { CommandLogPrismaRepository } from './infrastructure/persistence/command-log/command-log.prisma-repository.js';
import { GuildConfigPrismaRepository } from './infrastructure/persistence/guild/guild-config.prisma-repository.js';
import { getPrismaClient } from './infrastructure/persistence/prisma/prisma.client.js';
import { UserProfilePrismaRepository } from './infrastructure/persistence/user/user-profile.prisma-repository.js';
import { Bot } from './interface/discord/bot.js';
import { CommandRegistry } from './interface/discord/command-registry.js';
import { ConfigCommand } from './interface/discord/commands/config.command.js';
import { HelpCommand } from './interface/discord/commands/help.command.js';
import { PingCommand } from './interface/discord/commands/ping.command.js';
import { ErrorEvent } from './interface/discord/events/error.event.js';
import { GuildCreateEvent } from './interface/discord/events/guild-create.event.js';
import { InteractionCreateEvent } from './interface/discord/events/interaction-create.event.js';
import { ReadyEvent } from './interface/discord/events/ready.event.js';

export function buildContainer() {
  // Infrastructure
  const logger = createPinoLogger(config.logLevel, config.isDev);
  const metrics = new PrometheusMetrics();
  const prisma = getPrismaClient();
  const discordClient = createDiscordClient();

  // Repositories
  const guildConfigRepo = new GuildConfigPrismaRepository(prisma);
  const userProfileRepo = new UserProfilePrismaRepository(prisma);
  const commandLogRepo = new CommandLogPrismaRepository(prisma);

  // Use cases
  const getGuildConfig = new GetGuildConfigUseCase(guildConfigRepo, logger);
  const upsertGuildConfig = new UpsertGuildConfigUseCase(guildConfigRepo, logger);
  const getOrCreateUserProfile = new GetOrCreateUserProfileUseCase(userProfileRepo, logger);
  const addPoints = new AddPointsUseCase(userProfileRepo, logger);
  const logCommand = new LogCommandUseCase(commandLogRepo, logger, metrics);

  // Commands
  const commandRegistry = new CommandRegistry();
  commandRegistry.register(new PingCommand(logger, metrics));
  commandRegistry.register(new ConfigCommand(upsertGuildConfig, logger));
  commandRegistry.register(new HelpCommand(commandRegistry));

  // Events
  const events = [
    new ReadyEvent(logger, metrics),
    new InteractionCreateEvent(commandRegistry, logCommand, logger, metrics),
    new GuildCreateEvent(upsertGuildConfig, logger, metrics),
    new ErrorEvent(logger),
  ];

  const bot = new Bot(discordClient, commandRegistry, events, logger);

  return {
    bot,
    logger,
    metrics,
    prisma,
    // Expose use cases for potential future use (e.g., HTTP API)
    useCases: { getGuildConfig, upsertGuildConfig, getOrCreateUserProfile, addPoints, logCommand },
  };
}
