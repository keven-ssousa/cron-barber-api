import { AppointmentStatus } from "@prisma/client";
import { Context } from "koa";
import { container } from "tsyringe";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";

export async function handleListAppointments(ctx: Context) {
  try {
    const { slug } = ctx.params;
    const { status, startDate, endDate } = ctx.query;

    // Get barbershop
    const barbershopRepository = container.resolve<BarbershopRepository>(
      "BarbershopRepository",
    );
    const barbershop = await barbershopRepository.findBySlug(slug);

    if (!barbershop) {
      ctx.status = 404;
      ctx.body = { error: "Barbershop not found" };
      return;
    }

    // Check if user is the owner
    if (barbershop.ownerId !== ctx.state.user.id) {
      ctx.status = 403;
      ctx.body = {
        error: "Not authorized to access this barbershop's appointments",
      };
      return;
    }

    // Get appointments
    const appointmentRepository = container.resolve<AppointmentRepository>(
      "AppointmentRepository",
    );
    const appointments = await appointmentRepository.findByBarbershopId(
      barbershop.id as number,
    );

    // Filter by status if provided
    let filteredAppointments = appointments;
    if (
      status &&
      Object.values(AppointmentStatus).includes(status as AppointmentStatus)
    ) {
      filteredAppointments = appointments.filter(
        (app) => app.status === status,
      );
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filteredAppointments = filteredAppointments.filter(
          (app) => app.startTime >= start && app.startTime <= end,
        );
      }
    }

    ctx.body = filteredAppointments.map((appointment) => ({
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      notes: appointment.notes,
      cancelToken: appointment.cancelToken,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    }));
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
}
