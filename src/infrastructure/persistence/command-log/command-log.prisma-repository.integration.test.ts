import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CommandLog } from '../../../domain/command-log/entities/command-log.entity.js';
import { CommandName } from '../../../domain/command-log/value-objects/command-name.vo.js';
import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import { UserId } from '../../../domain/user/value-objects/user-id.vo.js';
import { PrismaClient } from '../../../generated/prisma/index.js';
import { CommandLogPrismaRepository } from './command-log.prisma-repository.js';

const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:5433/discord_bot_test';

describe('CommandLogPrismaRepository (integration)', () => {
  let prisma: PrismaClient;
  let repo: CommandLogPrismaRepository;

  beforeAll(() => {
    prisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } });
    repo = new CommandLogPrismaRepository(prisma);
  });

  afterEach(async () => {
    await prisma.commandLog.deleteMany();
  });

  it('save persists a CommandLog with UUID id and executedAt', async () => {
    const log = CommandLog.create(
      GuildId.reconstitute('111111111111111111'),
      UserId.reconstitute('222222222222222222'),
      CommandName.reconstitute('ping'),
    );

    await repo.save(log);

    const record = await prisma.commandLog.findUnique({ where: { id: log.id } });
    expect(record).not.toBeNull();
    expect(record!.commandName).toBe('ping');
    expect(record!.guildId).toBe('111111111111111111');
    expect(record!.executedAt).toBeInstanceOf(Date);
  });

  it('findByGuild returns logs for correct guild sorted by executedAt DESC with limit', async () => {
    const guild1 = GuildId.reconstitute('111111111111111111');
    const guild2 = GuildId.reconstitute('333333333333333333');
    const userId = UserId.reconstitute('222222222222222222');

    for (let i = 0; i < 5; i++) {
      await repo.save(CommandLog.create(guild1, userId, CommandName.reconstitute('ping')));
    }
    for (let i = 0; i < 2; i++) {
      await repo.save(CommandLog.create(guild2, userId, CommandName.reconstitute('config')));
    }

    const results = await repo.findByGuild(guild1, 3);

    expect(results).toHaveLength(3);
    expect(results.every((l) => l.guildId.value === '111111111111111111')).toBe(true);
    const dates = results.map((l) => l.executedAt.getTime());
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
    expect(dates[1]).toBeGreaterThanOrEqual(dates[2]);
  });

  it('findByGuild returns empty array for unknown guildId', async () => {
    const result = await repo.findByGuild(GuildId.reconstitute('999999999999999999'), 10);
    expect(result).toEqual([]);
  });
});
