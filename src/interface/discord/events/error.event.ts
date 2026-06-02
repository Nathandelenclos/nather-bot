import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IDiscordEvent } from './base.event.js';

export class ErrorEvent implements IDiscordEvent<'error'> {
  readonly name = 'error' as const;
  readonly once = false;

  constructor(private readonly logger: ILogger) {}

  async execute(error: Error): Promise<void> {
    this.logger.error('Discord client error', { error: error.message, stack: error.stack });
  }
}
