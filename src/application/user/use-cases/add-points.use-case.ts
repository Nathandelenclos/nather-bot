import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { type DomainError, Result } from '../../../domain/shared/index.js';
import { UserProfileNotFoundError } from '../../../domain/user/errors/user.errors.js';
import {
  type IUserProfileRepository,
  Points,
  UserId,
  type UserProfile,
} from '../../../domain/user/index.js';

export interface AddPointsCommand {
  userId: string;
  guildId: string;
  amount: number;
}

export class AddPointsUseCase {
  constructor(
    private readonly userProfileRepo: IUserProfileRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(cmd: AddPointsCommand): Promise<Result<UserProfile, DomainError>> {
    const userIdResult = UserId.create(cmd.userId);
    if (!userIdResult.ok) return userIdResult;

    const guildIdResult = GuildId.create(cmd.guildId);
    if (!guildIdResult.ok) return guildIdResult;

    const pointsResult = Points.create(cmd.amount);
    if (!pointsResult.ok) return pointsResult;

    const profile = await this.userProfileRepo.findByUserAndGuild(
      userIdResult.value,
      guildIdResult.value,
    );

    if (!profile) {
      return Result.fail(new UserProfileNotFoundError(cmd.userId, cmd.guildId));
    }

    const addResult = profile.addPoints(pointsResult.value);
    if (!addResult.ok) return addResult;

    const saved = await this.userProfileRepo.upsert(profile);
    this.logger.info('Points added', { userId: cmd.userId, amount: cmd.amount });
    return Result.ok(saved);
  }
}
