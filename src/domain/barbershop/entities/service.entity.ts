import { Money } from "../../common/value-objects/money.vo";

export class Service {
  private readonly _id?: number;
  private _name: string;
  private _description?: string;
  private _price: Money;
  private _durationMinutes: number;
  private _isActive: boolean;
  private readonly _barbershopId: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id?: number;
    name: string;
    description?: string;
    price: Money;
    durationMinutes: number;
    isActive?: boolean;
    barbershopId: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validate(props);
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._durationMinutes = props.durationMinutes;
    this._isActive = props.isActive ?? true;
    this._barbershopId = props.barbershopId;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  private validate(props: {
    name: string;
    durationMinutes: number;
    barbershopId: number;
  }): void {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error("Nome do serviço deve ter pelo menos 3 caracteres");
    }

    if (props.durationMinutes <= 0) {
      throw new Error("Duração do serviço deve ser maior que 0 minutos");
    }

    if (props.barbershopId <= 0) {
      throw new Error("ID da barbearia inválido");
    }
  }

  get id(): number | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    if (!name || name.trim().length < 3) {
      throw new Error("Nome do serviço deve ter pelo menos 3 caracteres");
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  get description(): string | undefined {
    return this._description;
  }

  set description(description: string | undefined) {
    this._description = description;
    this._updatedAt = new Date();
  }

  get price(): Money {
    return this._price;
  }

  set price(price: Money) {
    this._price = price;
    this._updatedAt = new Date();
  }

  get durationMinutes(): number {
    return this._durationMinutes;
  }

  set durationMinutes(durationMinutes: number) {
    if (durationMinutes <= 0) {
      throw new Error("Duração do serviço deve ser maior que 0 minutos");
    }
    this._durationMinutes = durationMinutes;
    this._updatedAt = new Date();
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(isActive: boolean) {
    this._isActive = isActive;
    this._updatedAt = new Date();
  }

  get barbershopId(): number {
    return this._barbershopId;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price.toJSON(),
      durationMinutes: this._durationMinutes,
      isActive: this._isActive,
      barbershopId: this._barbershopId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
