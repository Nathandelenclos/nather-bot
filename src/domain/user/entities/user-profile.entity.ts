import type { GuildId } from '../../guild/value-objects/guild-id.vo.js';
import { type DomainError, Entity, Result } from '../../shared/index.js';
import { Points } from '../value-objects/points.vo.js';
import type { UserId } from '../value-objects/user-id.vo.js';

export interface UserProfileProps {
  userId: UserId;
  guildId: GuildId;
  points: Points;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile extends Entity<string> {
  private props: UserProfileProps;

  private constructor(props: UserProfileProps) {
    super(`${props.userId.value}:${props.guildId.value}`);
    this.props = props;
  }

  get userId(): UserId {
    return this.props.userId;
  }
  get guildId(): GuildId {
    return this.props.guildId;
  }
  get points(): Points {
    return this.props.points;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(userId: UserId, guildId: GuildId): UserProfile {
    return new UserProfile({
      userId,
      guildId,
      points: Points.zero(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  addPoints(amount: Points): Result<void, DomainError> {
    const newPoints = this.props.points.add(amount);
    this.props.points = newPoints;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  resetPoints(): void {
    this.props.points = Points.zero();
    this.props.updatedAt = new Date();
  }
}
