import { BarberAppointment } from "./barber-appointment";

export interface BarberAppointmentRepository {
  getOneBy(id: number): Promise<BarberAppointment>;
}
