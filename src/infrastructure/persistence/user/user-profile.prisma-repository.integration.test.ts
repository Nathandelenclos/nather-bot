import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import { UserProfile } from '../../../domain/user/entities/user-profile.entity.js';
import { Points } from '../../../domain/user/value-objects/points.vo.js';
import { UserId } from '../../../domain/user/value-objects/user-id.vo.js';
import { PrismaClient } from '../../../generated/prisma/index.js';
import { UserProfilePrismaRepository } from './user-profile.prisma-repository.js';

const TEST_DB_URL = 'postgresql://postgres:postgres@localhost:5433/discord_bot_test';

describe('UserProfilePrismaRepository (integration)', () => {
  let prisma: PrismaClient;
  let repo: UserProfilePrismaRepository;

  beforeAll(() => {
    prisma = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } });
    repo = new UserProfilePrismaRepository(prisma);
  });

  afterEach(async () => {
    await prisma.userProfile.deleteMany();
  });

  it('upsert creates a new UserProfile with 0 points and composite PK', async () => {
    const userId = UserId.reconstitute('111111111111111111');
    const guildId = GuildId.reconstitute('222222222222222222');
    const profile = UserProfile.create(userId, guildId);

    await repo.upsert(profile);

    const found = await repo.findByUserAndGuild(userId, guildId);
    expect(found).not.toBeNull();
    expect(found!.userId.value).toBe('111111111111111111');
    expect(found!.guildId.value).toBe('222222222222222222');
    expect(found!.points.value).toBe(0);
  });

  it('upsert updates points of an existing UserProfile', async () => {
    const userId = UserId.reconstitute('333333333333333333');
    const guildId = GuildId.reconstitute('444444444444444444');
    const profile = UserProfile.create(userId, guildId);
    await repo.upsert(profile);

    profile.addPoints(Points.reconstitute(25));
    await repo.upsert(profile);

    const records = await prisma.userProfile.findMany({
      where: { userId: '333333333333333333', guildId: '444444444444444444' },
    });
    expect(records).toHaveLength(1);
    expect(records[0].points).toBe(25);
  });

  it('findByUserAndGuild returns null for unknown user/guild', async () => {
    const result = await repo.findByUserAndGuild(
      UserId.reconstitute('999999999999999999'),
      GuildId.reconstitute('888888888888888888'),
    );
    expect(result).toBeNull();
  });
});
