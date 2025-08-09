import { Appointment } from "../entities/appointment.entity";

export interface AppointmentRepository {
  findById(id: number): Promise<Appointment | null>;
  findByCancelToken(cancelToken: string): Promise<Appointment | null>;
  findByCustomerId(customerId: number): Promise<Appointment[]>;
  findByBarbershopId(barbershopId: number): Promise<Appointment[]>;
  findByDateRange(
    barbershopId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]>;
  create(appointment: Appointment): Promise<Appointment>;
  update(appointment: Appointment): Promise<Appointment>;
  delete(id: number): Promise<boolean>;
  checkForConflicts(
    barbershopId: number,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: number,
  ): Promise<boolean>;
}
