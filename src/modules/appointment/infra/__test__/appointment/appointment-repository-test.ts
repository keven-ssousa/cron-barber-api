import { Appointment } from "../../../domain/appointment";
import { AppointmentFilter } from "../../../domain/appointment-filter";
import { AppointmentRepository } from "../../../domain/appointment-repository";

export class AppointmentRepositoryTest implements AppointmentRepository {
  private appointments: Appointment[] = [
    new Appointment({
      active: true,
      barberId: 23,
      customerId: 12,
      id: 23333,
      schedule: new Date("12/02/2024"),
    }),
  ];

  async create(appointment: AppointmentFilter): Promise<Appointment> {
    return new Appointment({
      customerId: 23,
      active: true,
      barberId: 12,
      id: 344,
      schedule: new Date("12/02/2024"),
    });
  }
  async getAppointment(id: number): Promise<Appointment> {
    return this.appointments.find(
      (appointment) => appointment.getId() === id,
    ) as Appointment;
  }
}
