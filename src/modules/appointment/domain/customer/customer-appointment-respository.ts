import { CustomerAppointment } from "./customer-appointment";

export interface CustomerAppointmentRepository {
  getOne(id: number): Promise<CustomerAppointment>;
}
