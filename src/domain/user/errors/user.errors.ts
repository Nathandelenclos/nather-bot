import { DomainError } from '../../shared/index.js';

export class UserProfileNotFoundError extends DomainError {
  constructor(userId: string, guildId: string) {
    super(
      'USER_PROFILE_NOT_FOUND',
      `User profile not found for user ${userId} in guild ${guildId}`,
    );
  }
}
