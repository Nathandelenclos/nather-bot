import type { GuildId } from '../../guild/value-objects/guild-id.vo.js';
import { Entity } from '../../shared/index.js';
import type { UserId } from '../../user/value-objects/user-id.vo.js';
import type { CommandName } from '../value-objects/command-name.vo.js';

export interface CommandLogProps {
  id: string;
  guildId: GuildId;
  userId: UserId;
  commandName: CommandName;
  executedAt: Date;
}

export class CommandLog extends Entity<string> {
  private constructor(private readonly props: CommandLogProps) {
    super(props.id);
  }

  get guildId(): GuildId {
    return this.props.guildId;
  }
  get userId(): UserId {
    return this.props.userId;
  }
  get commandName(): CommandName {
    return this.props.commandName;
  }
  get executedAt(): Date {
    return this.props.executedAt;
  }

  static create(guildId: GuildId, userId: UserId, commandName: CommandName): CommandLog {
    return new CommandLog({
      id: crypto.randomUUID(),
      guildId,
      userId,
      commandName,
      executedAt: new Date(),
    });
  }

  static reconstitute(props: CommandLogProps): CommandLog {
    return new CommandLog(props);
  }
}
