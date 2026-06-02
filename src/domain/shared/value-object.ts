export abstract class ValueObject<T extends Record<string, unknown>> {
  constructor(protected readonly props: T) {
    Object.freeze(this.props);
  }

  equals(other: ValueObject<T>): boolean {
    if (!(other instanceof this.constructor)) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
