import { Context } from "koa";
import { container } from "tsyringe";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";

export async function handleGetAppointment(ctx: Context) {
  try {
    const { slug, id } = ctx.params;

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
      ctx.body = { error: "Not authorized to access this appointment" };
      return;
    }

    // Get appointment
    const appointmentRepository = container.resolve<AppointmentRepository>(
      "AppointmentRepository",
    );
    const appointment = await appointmentRepository.findById(Number(id));

    if (!appointment) {
      ctx.status = 404;
      ctx.body = { error: "Appointment not found" };
      return;
    }

    // Verify appointment belongs to this barbershop
    if (appointment.barbershopId !== barbershop.id) {
      ctx.status = 404;
      ctx.body = { error: "Appointment not found" };
      return;
    }

    ctx.body = {
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      notes: appointment.notes,
      cancelToken: appointment.cancelToken,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
}
