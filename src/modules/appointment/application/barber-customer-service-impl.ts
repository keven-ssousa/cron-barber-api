import { inject, injectable } from "tsyringe";
import { BarberAppointment } from "../domain/barber/barber-appointment";
import { BarberAppointmentRepository } from "../domain/barber/barber-appointment-repository";
import { BarberAppointmentService } from "../domain/barber/barber-appointment-service";
import { BarberAppointmentEnums } from "../domain/barber/barber-appointment-types";

@injectable()
export class BarberAppointmetServiceImpementation
  implements BarberAppointmentService
{
  constructor(
    @inject(BarberAppointmentEnums.BARBER_REPOSITORY)
    protected barberAppointmentRepository: BarberAppointmentRepository,
  ) {}

  getBarber(barberId: number): Promise<BarberAppointment> {
    return this.barberAppointmentRepository.getOneBy(barberId);
  }
}
