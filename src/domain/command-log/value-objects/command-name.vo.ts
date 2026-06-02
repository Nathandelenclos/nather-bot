import { DomainError, Result, ValueObject } from '../../shared/index.js';

class InvalidCommandNameError extends DomainError {
  constructor(value: string) {
    super('INVALID_COMMAND_NAME', `"${value}" is not a valid command name`);
  }
}

export class CommandName extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }

  static create(value: string): Result<CommandName, DomainError> {
    if (!value || /\s/.test(value) || value !== value.toLowerCase()) {
      return Result.fail(new InvalidCommandNameError(value));
    }
    return Result.ok(new CommandName({ value }));
  }

  static reconstitute(value: string): CommandName {
    return new CommandName({ value });
  }
}
