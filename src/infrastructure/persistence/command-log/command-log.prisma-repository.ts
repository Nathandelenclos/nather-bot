import {
  CommandLog,
  CommandName,
  type ICommandLogRepository,
} from '../../../domain/command-log/index.js';
import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import { UserId } from '../../../domain/user/value-objects/user-id.vo.js';
import type { PrismaClient } from '../../../generated/prisma/index.js';
import type { CommandLog as PrismaCommandLog } from '../../../generated/prisma/index.js';

function toDomain(record: PrismaCommandLog): CommandLog {
  return CommandLog.reconstitute({
    id: record.id,
    guildId: GuildId.reconstitute(record.guildId),
    userId: UserId.reconstitute(record.userId),
    commandName: CommandName.reconstitute(record.commandName),
    executedAt: record.executedAt,
  });
}

export class CommandLogPrismaRepository implements ICommandLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(log: CommandLog): Promise<void> {
    await this.prisma.commandLog.create({
      data: {
        id: log.id,
        guildId: log.guildId.value,
        userId: log.userId.value,
        commandName: log.commandName.value,
        executedAt: log.executedAt,
      },
    });
  }

  async findByGuild(guildId: GuildId, limit: number): Promise<CommandLog[]> {
    const records = await this.prisma.commandLog.findMany({
      where: { guildId: guildId.value },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
    return records.map(toDomain);
  }
}
