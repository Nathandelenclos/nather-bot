import type { GuildId } from '../../guild/value-objects/guild-id.vo.js';
import type { CommandLog } from '../entities/command-log.entity.js';

export interface ICommandLogRepository {
  save(log: CommandLog): Promise<void>;
  findByGuild(guildId: GuildId, limit: number): Promise<CommandLog[]>;
}

export const COMMAND_LOG_REPOSITORY = Symbol('ICommandLogRepository');
