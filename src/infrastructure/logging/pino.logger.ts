import pino from 'pino';
import type { ILogger } from '../../domain/ports/logger.port.js';

export function createPinoLogger(level: string, isDev: boolean): ILogger {
  const logger = pino({
    level,
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
    }),
  });

  return {
    debug: (message, context) => logger.debug(context ?? {}, message),
    info: (message, context) => logger.info(context ?? {}, message),
    warn: (message, context) => logger.warn(context ?? {}, message),
    error: (message, context) => logger.error(context ?? {}, message),
  };
}
