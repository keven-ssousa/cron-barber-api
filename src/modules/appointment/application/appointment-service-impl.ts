import { inject, injectable } from "tsyringe";
import { Appointment } from "../domain/appointment";
import { AppointmentFilter } from "../domain/appointment-filter";
import { AppointmentRepository } from "../domain/appointment-repository";
import { AppointmentService } from "../domain/appointment-service";
import { AppointmentEnums } from "../domain/appointment-types";

@injectable()
export class AppointmentServiceImplementation implements AppointmentService {
  constructor(
    @inject(AppointmentEnums.REPOSITORY)
    private appointmentRepository: AppointmentRepository,
  ) {}

  async createAppointment(
    appointment: AppointmentFilter,
  ): Promise<Appointment> {
    return this.appointmentRepository.create(appointment);
  }

  async getAppointment(id: number): Promise<Appointment> {
    return this.appointmentRepository.getAppointment(id);
  }
}
