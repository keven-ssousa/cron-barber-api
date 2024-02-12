import { CustomerAppointment } from "./customer-appointment";

export interface CustomerAppointmentService {
  getCustomer(id: number): Promise<CustomerAppointment>;
}
