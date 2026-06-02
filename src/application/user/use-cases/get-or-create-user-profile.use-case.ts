import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { type DomainError, Result } from '../../../domain/shared/index.js';
import { type IUserProfileRepository, UserId, UserProfile } from '../../../domain/user/index.js';

export interface GetOrCreateUserProfileCommand {
  userId: string;
  guildId: string;
}

export class GetOrCreateUserProfileUseCase {
  constructor(
    private readonly userProfileRepo: IUserProfileRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(cmd: GetOrCreateUserProfileCommand): Promise<Result<UserProfile, DomainError>> {
    const userIdResult = UserId.create(cmd.userId);
    if (!userIdResult.ok) return userIdResult;

    const guildIdResult = GuildId.create(cmd.guildId);
    if (!guildIdResult.ok) return guildIdResult;

    let profile = await this.userProfileRepo.findByUserAndGuild(
      userIdResult.value,
      guildIdResult.value,
    );

    if (!profile) {
      profile = UserProfile.create(userIdResult.value, guildIdResult.value);
      profile = await this.userProfileRepo.upsert(profile);
      this.logger.info('Created new user profile', { userId: cmd.userId, guildId: cmd.guildId });
    }

    return Result.ok(profile);
  }
}
