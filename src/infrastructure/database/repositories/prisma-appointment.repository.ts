import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";
import {
  Appointment,
  AppointmentStatus,
} from "../../../domain/appointment/entities/appointment.entity";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";

@injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Função auxiliar para mapear status do Prisma para o domínio
  private mapPrismaStatusToDomain(status: string): AppointmentStatus {
    switch (status) {
      case "CONFIRMED":
        return AppointmentStatus.CONFIRMED;
      case "CANCELED":
        return AppointmentStatus.CANCELED;
      case "COMPLETED":
        return AppointmentStatus.COMPLETED;
      case "NO_SHOW":
        return AppointmentStatus.NO_SHOW;
      default:
        return AppointmentStatus.CONFIRMED;
    }
  }

  // Função auxiliar para mapear status do domínio para o Prisma
  private mapDomainStatusToPrisma(status: AppointmentStatus): any {
    return status.toString();
  }

  async findById(id: number): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });

    if (!appointment) {
      return null;
    }

    return new Appointment({
      id: appointment.id,
      barbershopId: appointment.barbershopId,
      customerId: appointment.customerId,
      serviceId: appointment.serviceId,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: this.mapPrismaStatusToDomain(appointment.status),
      cancelToken: appointment.cancelToken || "",
      notes: appointment.notes || undefined,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    });
  }

  async findByCancelToken(cancelToken: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findFirst({
      where: { cancelToken },
      include: {
        service: true,
      },
    });

    if (!appointment) {
      return null;
    }

    return new Appointment({
      id: appointment.id,
      barbershopId: appointment.barbershopId,
      customerId: appointment.customerId,
      serviceId: appointment.serviceId,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: this.mapPrismaStatusToDomain(appointment.status),
      cancelToken: appointment.cancelToken || "",
      notes: appointment.notes || undefined,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    });
  }

  async findByCustomerId(customerId: number): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { customerId },
      include: {
        service: true,
      },
      orderBy: { startTime: "desc" },
    });

    return appointments.map(
      (appointment) =>
        new Appointment({
          id: appointment.id,
          barbershopId: appointment.barbershopId,
          customerId: appointment.customerId,
          serviceId: appointment.serviceId,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: this.mapPrismaStatusToDomain(appointment.status),
          cancelToken: appointment.cancelToken || "",
          notes: appointment.notes || undefined,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        }),
    );
  }

  async findByBarbershopId(barbershopId: number): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { barbershopId },
      include: {
        service: true,
      },
      orderBy: { startTime: "desc" },
    });

    return appointments.map(
      (appointment) =>
        new Appointment({
          id: appointment.id,
          barbershopId: appointment.barbershopId,
          customerId: appointment.customerId,
          serviceId: appointment.serviceId,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: this.mapPrismaStatusToDomain(appointment.status),
          cancelToken: appointment.cancelToken || "",
          notes: appointment.notes || undefined,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        }),
    );
  }

  async findByDateRange(
    barbershopId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        barbershopId,
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        service: true,
      },
      orderBy: { startTime: "asc" },
    });

    return appointments.map(
      (appointment) =>
        new Appointment({
          id: appointment.id,
          barbershopId: appointment.barbershopId,
          customerId: appointment.customerId,
          serviceId: appointment.serviceId,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: this.mapPrismaStatusToDomain(appointment.status),
          cancelToken: appointment.cancelToken || "",
          notes: appointment.notes || undefined,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        }),
    );
  }

  async create(appointment: Appointment): Promise<Appointment> {
    const createdAppointment = await this.prisma.appointment.create({
      data: {
        barbershop: {
          connect: {
            id: appointment.barbershopId,
          },
        },
        customer: {
          connect: {
            id: appointment.customerId,
          },
        },
        service: {
          connect: {
            id: appointment.serviceId,
          },
        },
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: this.mapDomainStatusToPrisma(appointment.status),
        cancelToken: appointment.cancelToken,
        notes: appointment.notes,
      },
      include: {
        service: true,
      },
    });

    return new Appointment({
      id: createdAppointment.id,
      barbershopId: createdAppointment.barbershopId,
      customerId: createdAppointment.customerId,
      serviceId: createdAppointment.serviceId,
      startTime: createdAppointment.startTime,
      endTime: createdAppointment.endTime,
      status: this.mapPrismaStatusToDomain(createdAppointment.status),
      cancelToken: createdAppointment.cancelToken || "",
      notes: createdAppointment.notes || undefined,
      createdAt: createdAppointment.createdAt,
      updatedAt: createdAppointment.updatedAt,
    });
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        barbershopId: appointment.barbershopId,
        customerId: appointment.customerId,
        serviceId: appointment.serviceId,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: this.mapDomainStatusToPrisma(appointment.status),
        cancelToken: appointment.cancelToken,
        notes: appointment.notes,
      },
      include: {
        service: true,
      },
    });

    return new Appointment({
      id: updatedAppointment.id,
      barbershopId: updatedAppointment.barbershopId,
      customerId: updatedAppointment.customerId,
      serviceId: updatedAppointment.serviceId,
      startTime: updatedAppointment.startTime,
      endTime: updatedAppointment.endTime,
      status: this.mapPrismaStatusToDomain(updatedAppointment.status),
      cancelToken: updatedAppointment.cancelToken || "",
      notes: updatedAppointment.notes || undefined,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.appointment.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error(`Erro ao excluir agendamento ${id}:`, error);
      return false;
    }
  }

  async checkForConflicts(
    barbershopId: number,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: number,
  ): Promise<boolean> {
    const conflictingAppointments = await this.prisma.appointment.findFirst({
      where: {
        barbershopId,
        status: { not: "CANCELED" },
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        OR: [
          // Começa durante outro agendamento
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          // Termina durante outro agendamento
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          // Contém completamente outro agendamento
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    return !!conflictingAppointments;
  }
}
