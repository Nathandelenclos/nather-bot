import { DomainError, Result, ValueObject } from '../../shared/index.js';

class InvalidPointsError extends DomainError {
  constructor(value: number) {
    super('INVALID_POINTS', `Points must be non-negative, got ${value}`);
  }
}

export class Points extends ValueObject<{ value: number }> {
  get value(): number {
    return this.props.value;
  }

  static create(value: number): Result<Points, DomainError> {
    if (!Number.isInteger(value) || value < 0) {
      return Result.fail(new InvalidPointsError(value));
    }
    return Result.ok(new Points({ value }));
  }

  static zero(): Points {
    return new Points({ value: 0 });
  }

  static reconstitute(value: number): Points {
    return new Points({ value });
  }

  add(other: Points): Points {
    return new Points({ value: this.props.value + other.props.value });
  }
}
