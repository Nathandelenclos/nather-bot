import { DomainError, Result, ValueObject } from '../../shared/index.js';

class InvalidUserIdError extends DomainError {
  constructor(value: string) {
    super('INVALID_USER_ID', `"${value}" is not a valid Discord Snowflake`);
  }
}

export class UserId extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static create(value: string): Result<UserId, DomainError> {
    if (!/^\d{17,20}$/.test(value)) {
      return Result.fail(new InvalidUserIdError(value));
    }
    return Result.ok(new UserId({ value }));
  }

  static reconstitute(value: string): UserId {
    return new UserId({ value });
  }
}
