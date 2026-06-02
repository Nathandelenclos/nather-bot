import { buildContainer } from './container.js';
import { config } from './infrastructure/config/env.js';
import { createMetricsServer } from './infrastructure/metrics/metrics.server.js';

const { bot, logger, metrics, prisma } = buildContainer();

const metricsServer = createMetricsServer(metrics.registry, config.metricsPort, logger);

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  await bot.stop();
  await prisma.$disconnect();
  metricsServer.close();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

await bot.start(config.discordToken);
