import { PrismaClient } from "@prisma/client";
import { Appointment } from "../../domain/appointment";
import { AppointmentFilter } from "../../domain/appointment-filter";
import { AppointmentRepository } from "../../domain/appointment-repository";
import { AppointmentAdapter } from "./adapter/appointment-entity";

export class AppointmentPrismaRepository implements AppointmentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  async create(appointment: AppointmentFilter): Promise<Appointment> {
    const appointmentAdapter = new AppointmentAdapter();

    const appointmentPrisma = appointmentAdapter.toPrisma(
      appointment.toJson() as any,
    );

    const appointmentCreated = await this.prisma.appointments.create({
      data: appointmentPrisma,
    });

    return new Appointment(appointmentCreated);
  }

  async getAppointment(id: number): Promise<Appointment> {
    const appointment = await this.prisma.appointments.findUnique({
      where: {
        id: id,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }
    return new Appointment(appointment);
  }
}
