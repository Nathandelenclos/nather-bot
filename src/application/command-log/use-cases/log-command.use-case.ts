import {
  CommandLog,
  CommandName,
  type ICommandLogRepository,
} from '../../../domain/command-log/index.js';
import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IMetrics } from '../../../domain/ports/metrics.port.js';
import { UserId } from '../../../domain/user/value-objects/user-id.vo.js';

export interface LogCommandCommand {
  guildId: string;
  userId: string;
  commandName: string;
}

export class LogCommandUseCase {
  constructor(
    private readonly commandLogRepo: ICommandLogRepository,
    private readonly logger: ILogger,
    private readonly metrics: IMetrics,
  ) {}

  async execute(cmd: LogCommandCommand): Promise<void> {
    try {
      const guildId = GuildId.reconstitute(cmd.guildId);
      const userId = UserId.reconstitute(cmd.userId);
      const commandNameResult = CommandName.create(cmd.commandName);
      if (!commandNameResult.ok) return;

      const log = CommandLog.create(guildId, userId, commandNameResult.value);
      await this.commandLogRepo.save(log);
      this.metrics.incrementCommandExecuted(cmd.commandName);
    } catch (err) {
      this.logger.error('Failed to log command', { cmd, err });
    }
  }
}
