import { BarberAppointment } from "./barber-appointment";

export interface BarberAppointmentService {
  getBarber(barberId: number): Promise<BarberAppointment>;
}
