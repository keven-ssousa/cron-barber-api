import { container } from "tsyringe";
import { AppointmentServiceImplementation } from "../../application/appointment-service-impl";
import { AppointmentEnums } from "../../domain/appointment-types";
import { AppointmentPrismaRepository } from "../repository/appointment";

export function getAppointmentBootstrap() {
  container.register(AppointmentEnums.REPOSITORY, AppointmentPrismaRepository);
  container.register(
    AppointmentEnums.SERVICE,
    AppointmentServiceImplementation,
  );
}
