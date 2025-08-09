import { TimeSlot } from "../../common/value-objects/time-slot.vo";

export enum AppointmentStatus {
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
}

export class Appointment {
  private readonly _id?: number;
  private readonly _timeSlot: TimeSlot;
  private _status: AppointmentStatus;
  private _cancellationReason?: string;
  private _notes?: string;
  private readonly _barbershopId: number;
  private readonly _serviceId: number;
  private readonly _customerId: number;
  private readonly _cancelToken: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id?: number;
    startTime: Date;
    endTime: Date;
    status?: AppointmentStatus;
    cancellationReason?: string;
    notes?: string;
    barbershopId: number;
    serviceId: number;
    customerId: number;
    cancelToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validate(props);
    this._id = props.id;
    this._timeSlot = new TimeSlot(props.startTime, props.endTime);
    this._status = props.status ?? AppointmentStatus.CONFIRMED;
    this._cancellationReason = props.cancellationReason;
    this._notes = props.notes;
    this._barbershopId = props.barbershopId;
    this._serviceId = props.serviceId;
    this._customerId = props.customerId;
    this._cancelToken = props.cancelToken ?? this.generateCancelToken();
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  private validate(props: {
    startTime: Date;
    endTime: Date;
    barbershopId: number;
    serviceId: number;
    customerId: number;
  }): void {
    if (props.barbershopId <= 0) {
      throw new Error("ID da barbearia inválido");
    }

    if (props.serviceId <= 0) {
      throw new Error("ID do serviço inválido");
    }

    if (props.customerId <= 0) {
      throw new Error("ID do cliente inválido");
    }
  }

  private generateCancelToken(): string {
    // Em um cenário real, usaríamos uma biblioteca como uuid
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  get id(): number | undefined {
    return this._id;
  }

  get startTime(): Date {
    return this._timeSlot.startTime;
  }

  get endTime(): Date {
    return this._timeSlot.endTime;
  }

  get timeSlot(): TimeSlot {
    return this._timeSlot;
  }

  get status(): AppointmentStatus {
    return this._status;
  }

  get cancellationReason(): string | undefined {
    return this._cancellationReason;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  set notes(notes: string | undefined) {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  get barbershopId(): number {
    return this._barbershopId;
  }

  get serviceId(): number {
    return this._serviceId;
  }

  get customerId(): number {
    return this._customerId;
  }

  get cancelToken(): string {
    return this._cancelToken;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get durationMinutes(): number {
    return this._timeSlot.durationMinutes;
  }

  cancel(reason?: string): void {
    if (this._status === AppointmentStatus.CANCELED) {
      throw new Error("Agendamento já está cancelado");
    }

    if (this._status === AppointmentStatus.COMPLETED) {
      throw new Error("Não é possível cancelar um agendamento já concluído");
    }

    this._status = AppointmentStatus.CANCELED;
    this._cancellationReason = reason;
    this._updatedAt = new Date();
  }

  complete(): void {
    if (this._status === AppointmentStatus.CANCELED) {
      throw new Error("Não é possível completar um agendamento cancelado");
    }

    if (this._status === AppointmentStatus.COMPLETED) {
      throw new Error("Agendamento já está concluído");
    }

    this._status = AppointmentStatus.COMPLETED;
    this._updatedAt = new Date();
  }

  markAsNoShow(): void {
    if (this._status === AppointmentStatus.CANCELED) {
      throw new Error(
        "Não é possível marcar como não compareceu um agendamento cancelado",
      );
    }

    if (this._status === AppointmentStatus.COMPLETED) {
      throw new Error(
        "Não é possível marcar como não compareceu um agendamento concluído",
      );
    }

    this._status = AppointmentStatus.NO_SHOW;
    this._updatedAt = new Date();
  }

  isActive(): boolean {
    return this._status === AppointmentStatus.CONFIRMED;
  }

  overlaps(other: Appointment): boolean {
    if (this._barbershopId !== other._barbershopId) {
      return false; // Não se sobrepõe se for em barbearias diferentes
    }

    return this._timeSlot.overlaps(other._timeSlot);
  }

  toJSON(): Record<string, any> {
    return {
      id: this._id,
      startTime: this._timeSlot.startTime.toISOString(),
      endTime: this._timeSlot.endTime.toISOString(),
      status: this._status,
      cancellationReason: this._cancellationReason,
      notes: this._notes,
      barbershopId: this._barbershopId,
      serviceId: this._serviceId,
      customerId: this._customerId,
      cancelToken: this._cancelToken,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      durationMinutes: this.durationMinutes,
    };
  }
}
