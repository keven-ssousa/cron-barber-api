export interface CustomerAppointmentDTO {
  customerId: number;
}

export class CustomerAppointment {
  constructor(protected params: CustomerAppointmentDTO) {}

  getCustomerId(): number {
    return this.params.customerId;
  }
}
