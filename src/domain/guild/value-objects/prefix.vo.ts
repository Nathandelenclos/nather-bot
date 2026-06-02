import { DomainError, Result, ValueObject } from '../../shared/index.js';

class InvalidPrefixError extends DomainError {
  constructor(reason: string) {
    super('INVALID_PREFIX', `Invalid prefix: ${reason}`);
  }
}

export class Prefix extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static create(value: string): Result<Prefix, DomainError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new InvalidPrefixError('cannot be empty'));
    }
    if (value.length > 5) {
      return Result.fail(new InvalidPrefixError('must be 5 characters or fewer'));
    }
    return Result.ok(new Prefix({ value }));
  }

  static reconstitute(value: string): Prefix {
    return new Prefix({ value });
  }
}
