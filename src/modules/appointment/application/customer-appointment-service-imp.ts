import { inject, injectable } from "tsyringe";
import { CustomerAppointment } from "../domain/customer/customer-appointment";
import { CustomerAppointmentRepository } from "../domain/customer/customer-appointment-respository";
import { CustomerAppointmentService } from "../domain/customer/customer-appointment-service";
import { CustomerAppointmentEnuns } from "../domain/customer/customer-appointment-types";

@injectable()
export class CustomerAppointmetServiceImpementation
  implements CustomerAppointmentService
{
  constructor(
    @inject(CustomerAppointmentEnuns.CUSTOMER_REPOSITORY)
    protected customerAppointmentRepository: CustomerAppointmentRepository,
  ) {}

  async getCustomer(id: number): Promise<CustomerAppointment> {
    return this.customerAppointmentRepository.getOne(id);
  }
}
