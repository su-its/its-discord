import type { Identifier } from "./Identifier";

export abstract class Entity<T extends Identifier<any>> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this._id.equals(object._id);
  }

  get id(): T {
    return this._id;
  }
}
