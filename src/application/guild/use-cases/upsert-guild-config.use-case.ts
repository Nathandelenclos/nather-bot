import {
  GuildConfig,
  GuildId,
  type IGuildConfigRepository,
  Prefix,
} from '../../../domain/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { type DomainError, Result } from '../../../domain/shared/index.js';

export interface UpsertGuildConfigCommand {
  guildId: string;
  prefix: string;
}

export class UpsertGuildConfigUseCase {
  constructor(
    private readonly guildConfigRepo: IGuildConfigRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(cmd: UpsertGuildConfigCommand): Promise<Result<GuildConfig, DomainError>> {
    const guildIdResult = GuildId.create(cmd.guildId);
    if (!guildIdResult.ok) return guildIdResult;

    const prefixResult = Prefix.create(cmd.prefix);
    if (!prefixResult.ok) return prefixResult;

    let config = await this.guildConfigRepo.findByGuildId(guildIdResult.value);

    if (config) {
      config.updatePrefix(prefixResult.value);
    } else {
      config = GuildConfig.create(guildIdResult.value, prefixResult.value);
    }

    const saved = await this.guildConfigRepo.upsert(config);
    this.logger.info('Guild config upserted', { guildId: cmd.guildId, prefix: cmd.prefix });
    return Result.ok(saved);
  }
}
