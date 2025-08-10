export type ID = string | number;

export class Entity {
  protected readonly _id?: number;

  constructor(id?: number) {
    this._id = id;
  }

  get id(): number | undefined {
    return this._id;
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
    };
  }
}
