import {
  GuildConfig,
  GuildId,
  type IGuildConfigRepository,
  Prefix,
} from '../../../domain/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { type DomainError, Result } from '../../../domain/shared/index.js';

export interface UpdateWelcomeChannelCommand {
  guildId: string;
  channelId: string | null;
}

export class UpdateWelcomeChannelUseCase {
  constructor(
    private readonly guildConfigRepo: IGuildConfigRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(cmd: UpdateWelcomeChannelCommand): Promise<Result<GuildConfig, DomainError>> {
    const guildIdResult = GuildId.create(cmd.guildId);
    if (!guildIdResult.ok) return guildIdResult;

    let config = await this.guildConfigRepo.findByGuildId(guildIdResult.value);
    if (!config) {
      config = GuildConfig.create(guildIdResult.value, Prefix.reconstitute('!'));
    }

    config.setWelcomeChannel(cmd.channelId);
    const saved = await this.guildConfigRepo.upsert(config);
    this.logger.info('Welcome channel updated', { guildId: cmd.guildId, channelId: cmd.channelId });
    return Result.ok(saved);
  }
}
