import type { GuildId } from '../../guild/value-objects/guild-id.vo.js';
import type { UserProfile } from '../entities/user-profile.entity.js';
import type { UserId } from '../value-objects/user-id.vo.js';

export interface IUserProfileRepository {
  findByUserAndGuild(userId: UserId, guildId: GuildId): Promise<UserProfile | null>;
  upsert(profile: UserProfile): Promise<UserProfile>;
}

export const USER_PROFILE_REPOSITORY = Symbol('IUserProfileRepository');
