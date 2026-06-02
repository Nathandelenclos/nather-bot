import { LogCommandUseCase } from './application/command-log/index.js';
import { GetGuildConfigUseCase, UpdateWelcomeChannelUseCase } from './application/guild/index.js';
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
import { ComponentRegistry } from './interface/discord/components/component-registry.js';
import { WelcomeChannelSelectHandler } from './interface/discord/components/welcome-channel-select.handler.js';
import { ErrorEvent } from './interface/discord/events/error.event.js';
import { GuildCreateEvent } from './interface/discord/events/guild-create.event.js';
import { GuildMemberAddEvent } from './interface/discord/events/guild-member-add.event.js';
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
  const updateWelcomeChannel = new UpdateWelcomeChannelUseCase(guildConfigRepo, logger);
  const getOrCreateUserProfile = new GetOrCreateUserProfileUseCase(userProfileRepo, logger);
  const addPoints = new AddPointsUseCase(userProfileRepo, logger);
  const logCommand = new LogCommandUseCase(commandLogRepo, logger, metrics);

  // Commands
  const commandRegistry = new CommandRegistry();
  commandRegistry.register(new PingCommand(logger, metrics));
  commandRegistry.register(new ConfigCommand(upsertGuildConfig, logger));
  commandRegistry.register(new HelpCommand(commandRegistry));

  // Components
  const componentRegistry = new ComponentRegistry();
  componentRegistry.register(new WelcomeChannelSelectHandler(updateWelcomeChannel, logger));

  // Events
  const events = [
    new ReadyEvent(logger, metrics),
    new InteractionCreateEvent(commandRegistry, componentRegistry, logCommand, logger, metrics),
    new GuildCreateEvent(upsertGuildConfig, logger, metrics),
    new GuildMemberAddEvent(getGuildConfig, getOrCreateUserProfile, logger),
    new ErrorEvent(logger),
  ];

  const bot = new Bot(discordClient, commandRegistry, events, logger);

  return {
    bot,
    logger,
    metrics,
    prisma,
    // Expose use cases for potential future use (e.g., HTTP API)
    useCases: {
      getGuildConfig,
      upsertGuildConfig,
      updateWelcomeChannel,
      getOrCreateUserProfile,
      addPoints,
      logCommand,
    },
  };
}
