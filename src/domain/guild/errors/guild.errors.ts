import { DomainError } from '../../shared/index.js';

export class GuildNotFoundError extends DomainError {
  constructor(guildId: string) {
    super('GUILD_NOT_FOUND', `Guild config not found for guild ${guildId}`);
  }
}
