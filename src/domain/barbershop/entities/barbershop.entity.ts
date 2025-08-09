import { ScheduleRule } from "../../common/value-objects/schedule-rule.vo";
import { Service } from "./service.entity";

export class BarberShop {
  private readonly _id?: number;
  private _name: string;
  private _slug: string;
  private _description?: string;
  private _address?: string;
  private _logoUrl?: string;
  private readonly _ownerId: number;
  private _timezone: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _services: Service[];
  private _scheduleRules: ScheduleRule[];

  constructor(props: {
    id?: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    logoUrl?: string;
    ownerId: number;
    timezone?: string;
    createdAt?: Date;
    updatedAt?: Date;
    services?: Service[];
    scheduleRules?: ScheduleRule[];
  }) {
    this.validate(props);
    this._id = props.id;
    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description;
    this._address = props.address;
    this._logoUrl = props.logoUrl;
    this._ownerId = props.ownerId;
    this._timezone = props.timezone ?? "UTC";
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
    this._services = props.services ?? [];
    this._scheduleRules = props.scheduleRules ?? [];
  }

  private validate(props: {
    name: string;
    slug: string;
    ownerId: number;
  }): void {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error("Nome da barbearia deve ter pelo menos 3 caracteres");
    }

    if (!props.slug || props.slug.trim().length < 3) {
      throw new Error("Slug da barbearia deve ter pelo menos 3 caracteres");
    }

    if (!/^[a-z0-9-]+$/.test(props.slug)) {
      throw new Error(
        "Slug deve conter apenas letras minúsculas, números e hífens",
      );
    }

    if (props.ownerId <= 0) {
      throw new Error("ID do proprietário inválido");
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
      throw new Error("Nome da barbearia deve ter pelo menos 3 caracteres");
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  get slug(): string {
    return this._slug;
  }

  set slug(slug: string) {
    if (!slug || slug.trim().length < 3) {
      throw new Error("Slug da barbearia deve ter pelo menos 3 caracteres");
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(
        "Slug deve conter apenas letras minúsculas, números e hífens",
      );
    }

    this._slug = slug;
    this._updatedAt = new Date();
  }

  get description(): string | undefined {
    return this._description;
  }

  set description(description: string | undefined) {
    this._description = description;
    this._updatedAt = new Date();
  }

  get address(): string | undefined {
    return this._address;
  }

  set address(address: string | undefined) {
    this._address = address;
    this._updatedAt = new Date();
  }

  get logoUrl(): string | undefined {
    return this._logoUrl;
  }

  set logoUrl(logoUrl: string | undefined) {
    this._logoUrl = logoUrl;
    this._updatedAt = new Date();
  }

  get ownerId(): number {
    return this._ownerId;
  }

  get timezone(): string {
    return this._timezone;
  }

  set timezone(timezone: string) {
    // Validação básica de timezone
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      this._timezone = timezone;
      this._updatedAt = new Date();
    } catch (error) {
      throw new Error(`Fuso horário '${timezone}' inválido`);
    }
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get services(): Service[] {
    return [...this._services];
  }

  get scheduleRules(): ScheduleRule[] {
    return [...this._scheduleRules];
  }

  addService(service: Service): void {
    if (service.barbershopId !== this._id) {
      throw new Error("O serviço não pertence a esta barbearia");
    }
    this._services.push(service);
  }

  removeService(serviceId: number): void {
    this._services = this._services.filter(
      (service) => service.id !== serviceId,
    );
  }

  addScheduleRule(scheduleRule: ScheduleRule): void {
    // Verifica se já existe uma regra para esse dia da semana
    const existingRuleIndex = this._scheduleRules.findIndex(
      (rule) => rule.dayOfWeek === scheduleRule.dayOfWeek,
    );

    if (existingRuleIndex >= 0) {
      // Substitui a regra existente
      this._scheduleRules[existingRuleIndex] = scheduleRule;
    } else {
      // Adiciona nova regra
      this._scheduleRules.push(scheduleRule);
    }
  }

  removeScheduleRule(dayOfWeek: number): void {
    this._scheduleRules = this._scheduleRules.filter(
      (rule) => rule.dayOfWeek !== dayOfWeek,
    );
  }

  isOpen(date: Date): boolean {
    const dayOfWeek = date.getUTCDay();
    const rule = this._scheduleRules.find(
      (rule) => rule.dayOfWeek === dayOfWeek && rule.isActive,
    );

    if (!rule) {
      return false; // Não há regra para este dia ou a regra está inativa
    }

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    const [ruleStartHour, ruleStartMinute] = rule.startTime
      .split(":")
      .map(Number);
    const [ruleEndHour, ruleEndMinute] = rule.endTime.split(":").map(Number);

    const timeMinutes = hours * 60 + minutes;
    const ruleStartMinutes = ruleStartHour * 60 + ruleStartMinute;
    const ruleEndMinutes = ruleEndHour * 60 + ruleEndMinute;

    return timeMinutes >= ruleStartMinutes && timeMinutes < ruleEndMinutes;
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug,
      description: this._description,
      address: this._address,
      logoUrl: this._logoUrl,
      ownerId: this._ownerId,
      timezone: this._timezone,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      services: this._services.map((service) => service.toJSON()),
      scheduleRules: this._scheduleRules.map((rule) => rule.toJSON()),
    };
  }
}
