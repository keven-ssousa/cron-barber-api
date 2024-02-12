import { container } from "tsyringe";
import { CustomerAppointmentService } from "./customer-appointment-service";
import { CustomerAppointmentEnuns } from "./customer-appointment-types";

export function getCustomerAppointmentService(): CustomerAppointmentService {
  return container.resolve<CustomerAppointmentService>(
    CustomerAppointmentEnuns.CUSTOMER_SERVICE
  );
}
