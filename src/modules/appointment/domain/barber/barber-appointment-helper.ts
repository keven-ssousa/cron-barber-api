import { container } from "tsyringe";
import { BarberAppointmentService } from "./barber-appointment-service";
import { BarberAppointmentEnums } from "./barber-appointment-types";

export function getBarberAppointmentService(): BarberAppointmentService {
  return container.resolve<BarberAppointmentService>(
    BarberAppointmentEnums.BARBER_SERVICE
  );
}
