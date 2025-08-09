import { PrismaClient } from "@prisma/client";
import { Appointment } from "../../domain/appointment";
import { AppointmentFilter } from "../../domain/appointment-filter";
import { AppointmentRepository } from "../../domain/appointment-repository";

export class AppointmentPrismaRepository implements AppointmentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(appointmentFilter: AppointmentFilter): Promise<Appointment> {
    // Convertendo do AppointmentFilter para o formato do Prisma
    const { startTime, endTime } = this.calculateTimeSlot(
      appointmentFilter.getSchedule(),
    );

    const appointmentCreated = await this.prisma.appointment.create({
      data: {
        startTime,
        endTime,
        barbershopId: 1, // Valor temporário, deve ser obtido por uma lógica de negócio
        serviceId: appointmentFilter.getBarberId(), // Mapeamento temporário
        customerId: appointmentFilter.getCustomerId(),
        status: "CONFIRMED",
      },
      include: {
        barbershop: true,
        service: true,
        customer: true,
      },
    });

    // Convertendo do formato Prisma para o formato do domínio de módulo
    return new Appointment({
      id: appointmentCreated.id,
      schedule: appointmentCreated.startTime,
      barberId: appointmentCreated.serviceId, // Mapeamento temporário
      customerId: appointmentCreated.customerId,
      active: appointmentCreated.status !== "CANCELED",
    });
  }

  async getAppointment(id: number): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: id,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    return new Appointment({
      id: appointment.id,
      schedule: appointment.startTime,
      barberId: appointment.serviceId, // Mapeamento temporário
      customerId: appointment.customerId,
      active: appointment.status !== "CANCELED",
    });
  }

  private calculateTimeSlot(schedule: Date): {
    startTime: Date;
    endTime: Date;
  } {
    // Lógica para calcular o endTime baseado no startTime e na duração do serviço
    // Como não temos a duração aqui, vamos usar um valor padrão de 1 hora
    const startTime = new Date(schedule);
    const endTime = new Date(schedule);
    endTime.setHours(endTime.getHours() + 1);

    return { startTime, endTime };
  }
}
