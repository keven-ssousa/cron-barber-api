import { PrismaClient } from "@prisma/client";
import { Appointment } from "../../domain/appointment";
import { AppointmentFilter } from "../../domain/appointment-filter";
import { AppointmentRepository } from "../../domain/appointment-repository";

export class AppointmentPrismaRepository implements AppointmentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  async create(appointment: AppointmentFilter): Promise<Appointment> {
    const appointmentCreated = await this.prisma.appointments.create({
      data: appointment.toJson(),
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
