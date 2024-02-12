import { CustomerAppointmentDTO } from "./customer-appointment-dto";

export class CustomerAppointment {
  constructor(protected params: CustomerAppointmentDTO) {}

  getCustomerId(): number {
    return this.params.customerId;
  }
}
