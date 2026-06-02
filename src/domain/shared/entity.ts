export abstract class Entity<TId> {
  constructor(readonly id: TId) {}

  equals(other: Entity<TId>): boolean {
    if (!(other instanceof this.constructor)) return false;
    return this.id === other.id;
  }
}
