import { container } from "tsyringe";
import { AppointmentService } from "./appointment-service";
import { AppointmentEnums } from "./appointment-types";

export function getAppointmentService(): AppointmentService {
  return container.resolve<AppointmentService>(AppointmentEnums.SERVICE);
}
