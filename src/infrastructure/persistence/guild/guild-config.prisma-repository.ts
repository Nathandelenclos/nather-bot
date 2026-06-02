import { GuildConfig, type IGuildConfigRepository } from '../../../domain/guild/index.js';
import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import { Prefix } from '../../../domain/guild/value-objects/prefix.vo.js';
import type { PrismaClient } from '../../../generated/prisma/index.js';
import type { GuildConfig as PrismaGuildConfig } from '../../../generated/prisma/index.js';

function toDomain(record: PrismaGuildConfig): GuildConfig {
  return GuildConfig.reconstitute({
    guildId: GuildId.reconstitute(record.guildId),
    prefix: Prefix.reconstitute(record.prefix),
    welcomeChannelId: record.welcomeChannelId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class GuildConfigPrismaRepository implements IGuildConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByGuildId(id: GuildId): Promise<GuildConfig | null> {
    const record = await this.prisma.guildConfig.findUnique({
      where: { guildId: id.value },
    });
    return record ? toDomain(record) : null;
  }

  async upsert(config: GuildConfig): Promise<GuildConfig> {
    const record = await this.prisma.guildConfig.upsert({
      where: { guildId: config.guildId.value },
      update: {
        prefix: config.prefix.value,
        welcomeChannelId: config.welcomeChannelId,
      },
      create: {
        guildId: config.guildId.value,
        prefix: config.prefix.value,
        welcomeChannelId: config.welcomeChannelId,
      },
    });
    return toDomain(record);
  }
}
