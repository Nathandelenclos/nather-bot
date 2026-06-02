import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import {
  type IUserProfileRepository,
  Points,
  UserId,
  UserProfile,
} from '../../../domain/user/index.js';
import type { PrismaClient } from '../../../generated/prisma/index.js';
import type { UserProfile as PrismaUserProfile } from '../../../generated/prisma/index.js';

function toDomain(record: PrismaUserProfile): UserProfile {
  return UserProfile.reconstitute({
    userId: UserId.reconstitute(record.userId),
    guildId: GuildId.reconstitute(record.guildId),
    points: Points.reconstitute(record.points),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class UserProfilePrismaRepository implements IUserProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserAndGuild(userId: UserId, guildId: GuildId): Promise<UserProfile | null> {
    const record = await this.prisma.userProfile.findUnique({
      where: { userId_guildId: { userId: userId.value, guildId: guildId.value } },
    });
    return record ? toDomain(record) : null;
  }

  async upsert(profile: UserProfile): Promise<UserProfile> {
    const record = await this.prisma.userProfile.upsert({
      where: {
        userId_guildId: { userId: profile.userId.value, guildId: profile.guildId.value },
      },
      update: { points: profile.points.value },
      create: {
        userId: profile.userId.value,
        guildId: profile.guildId.value,
        points: profile.points.value,
      },
    });
    return toDomain(record);
  }
}
