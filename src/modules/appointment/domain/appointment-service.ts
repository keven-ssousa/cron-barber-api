import { Appointment } from "./appointment";
import { AppointmentFilter } from "./appointment-filter";

export interface AppointmentService {
  createAppointment(appointment: AppointmentFilter): Promise<Appointment>;
  getAppointment(id: number): Promise<Appointment>;
}
