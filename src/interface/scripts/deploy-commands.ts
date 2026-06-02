import { REST, Routes } from 'discord.js';
import { UpsertGuildConfigUseCase } from '../../application/guild/index.js';
import { config } from '../../infrastructure/config/env.js';
import { createPinoLogger } from '../../infrastructure/logging/pino.logger.js';
import { PrometheusMetrics } from '../../infrastructure/metrics/prometheus.metrics.js';
import { GuildConfigPrismaRepository } from '../../infrastructure/persistence/guild/guild-config.prisma-repository.js';
import { getPrismaClient } from '../../infrastructure/persistence/prisma/prisma.client.js';
import { CommandRegistry } from '../discord/command-registry.js';
import { ConfigCommand } from '../discord/commands/config.command.js';
import { HelpCommand } from '../discord/commands/help.command.js';
import { PingCommand } from '../discord/commands/ping.command.js';

const logger = createPinoLogger(config.logLevel, config.isDev);
const metrics = new PrometheusMetrics();
const prisma = getPrismaClient();
const guildConfigRepo = new GuildConfigPrismaRepository(prisma);
const upsertGuildConfig = new UpsertGuildConfigUseCase(guildConfigRepo, logger);

const commandRegistry = new CommandRegistry();
commandRegistry.register(new PingCommand(logger, metrics));
commandRegistry.register(new ConfigCommand(upsertGuildConfig, logger));
commandRegistry.register(new HelpCommand(commandRegistry));

const commands = commandRegistry.all();

const rest = new REST().setToken(config.discordToken);

const body = commands.map((c) => c.data.toJSON());

try {
  logger.info(`Deploying ${body.length} slash commands...`);

  if (config.discordGuildId) {
    await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
      body,
    });
    logger.info(`Deployed to guild ${config.discordGuildId}`);
  } else {
    await rest.put(Routes.applicationCommands(config.discordClientId), { body });
    logger.info('Deployed globally');
  }
} finally {
  await prisma.$disconnect();
}
