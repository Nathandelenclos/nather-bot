import { DomainError, Result, ValueObject } from '../../shared/index.js';

class InvalidGuildIdError extends DomainError {
  constructor(value: string) {
    super('INVALID_GUILD_ID', `"${value}" is not a valid Discord Snowflake`);
  }
}

export class GuildId extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static create(value: string): Result<GuildId, DomainError> {
    if (!/^\d{17,20}$/.test(value)) {
      return Result.fail(new InvalidGuildIdError(value));
    }
    return Result.ok(new GuildId({ value }));
  }

  static reconstitute(value: string): GuildId {
    return new GuildId({ value });
  }
}
