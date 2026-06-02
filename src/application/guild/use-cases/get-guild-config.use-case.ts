import {
  GuildConfig,
  GuildId,
  type IGuildConfigRepository,
  Prefix,
} from '../../../domain/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { type DomainError, Result } from '../../../domain/shared/index.js';

export interface GetGuildConfigCommand {
  guildId: string;
}

export class GetGuildConfigUseCase {
  constructor(
    private readonly guildConfigRepo: IGuildConfigRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(cmd: GetGuildConfigCommand): Promise<Result<GuildConfig, DomainError>> {
    const guildIdResult = GuildId.create(cmd.guildId);
    if (!guildIdResult.ok) return guildIdResult;

    const config = await this.guildConfigRepo.findByGuildId(guildIdResult.value);

    if (config) return Result.ok(config);

    this.logger.debug('No guild config found, returning default', { guildId: cmd.guildId });
    const defaultConfig = GuildConfig.create(guildIdResult.value, Prefix.reconstitute('!'));
    return Result.ok(defaultConfig);
  }
}
