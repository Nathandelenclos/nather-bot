import type { Guild } from 'discord.js';
import type { UpsertGuildConfigUseCase } from '../../../application/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IMetrics } from '../../../domain/ports/metrics.port.js';
import type { IDiscordEvent } from './base.event.js';

export class GuildCreateEvent implements IDiscordEvent<'guildCreate'> {
  readonly name = 'guildCreate' as const;
  readonly once = false;

  constructor(
    private readonly upsertGuildConfig: UpsertGuildConfigUseCase,
    private readonly logger: ILogger,
    private readonly metrics: IMetrics,
  ) {}

  async execute(guild: Guild): Promise<void> {
    await this.upsertGuildConfig.execute({ guildId: guild.id, prefix: '!' });
    this.metrics.setActiveGuilds(guild.client.guilds.cache.size);
    this.logger.info('Bot joined guild', { guildId: guild.id, name: guild.name });
  }
}
