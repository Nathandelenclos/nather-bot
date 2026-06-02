import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { GuildConfig } from '../../../domain/guild/entities/guild-config.entity.js';
import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import { Prefix } from '../../../domain/guild/value-objects/prefix.vo.js';
import { PrismaClient } from '../../../generated/prisma/index.js';
import { GuildConfigPrismaRepository } from './guild-config.prisma-repository.js';

const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:5433/discord_bot_test';

describe('GuildConfigPrismaRepository (integration)', () => {
  let prisma: PrismaClient;
  let repo: GuildConfigPrismaRepository;

  beforeAll(() => {
    prisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } });
    repo = new GuildConfigPrismaRepository(prisma);
  });

  afterEach(async () => {
    await prisma.guildConfig.deleteMany();
  });

  it('upsert creates a new GuildConfig and findByGuildId returns it', async () => {
    const guildId = GuildId.reconstitute('111111111111111111');
    const prefix = Prefix.reconstitute('!');
    const config = GuildConfig.create(guildId, prefix);

    await repo.upsert(config);

    const found = await repo.findByGuildId(guildId);
    expect(found).not.toBeNull();
    expect(found!.guildId.value).toBe('111111111111111111');
    expect(found!.prefix.value).toBe('!');
  });

  it('upsert updates prefix of an existing GuildConfig (no duplicate)', async () => {
    const guildId = GuildId.reconstitute('222222222222222222');
    const config = GuildConfig.create(guildId, Prefix.reconstitute('!'));
    await repo.upsert(config);

    config.updatePrefix(Prefix.reconstitute('?'));
    await repo.upsert(config);

    const records = await prisma.guildConfig.findMany({ where: { guildId: '222222222222222222' } });
    expect(records).toHaveLength(1);
    expect(records[0].prefix).toBe('?');
  });

  it('findByGuildId returns null for unknown guildId', async () => {
    const guildId = GuildId.reconstitute('999999999999999999');
    const result = await repo.findByGuildId(guildId);
    expect(result).toBeNull();
  });
});
