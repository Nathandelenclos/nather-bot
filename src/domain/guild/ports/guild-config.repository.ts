import type { GuildConfig } from '../entities/guild-config.entity.js';
import type { GuildId } from '../value-objects/guild-id.vo.js';

export interface IGuildConfigRepository {
  findByGuildId(id: GuildId): Promise<GuildConfig | null>;
  upsert(config: GuildConfig): Promise<GuildConfig>;
}

export const GUILD_CONFIG_REPOSITORY = Symbol('IGuildConfigRepository');
