import type { Client } from 'discord.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IMetrics } from '../../../domain/ports/metrics.port.js';
import type { IDiscordEvent } from './base.event.js';

export class ReadyEvent implements IDiscordEvent<'ready'> {
  readonly name = 'ready' as const;
  readonly once = true;

  constructor(
    private readonly logger: ILogger,
    private readonly metrics: IMetrics,
  ) {}

  async execute(client: Client<true>): Promise<void> {
    this.metrics.setActiveGuilds(client.guilds.cache.size);
    this.logger.info('Bot ready', { tag: client.user.tag, guilds: client.guilds.cache.size });
  }
}
