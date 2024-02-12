import { Appointment } from "./appointment";
import { AppointmentFilter } from "./appointment-filter";

export interface AppointmentRepository {
  create(appointment: AppointmentFilter): Promise<Appointment>;
  getAppointment(id: number): Promise<Appointment>;
}
