import { AppointmentStatus } from "@prisma/client";
import { Context } from "koa";
import { container } from "tsyringe";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";

interface UpdateAppointmentBody {
  status?: AppointmentStatus;
  notes?: string;
}

export async function handleUpdateAppointment(ctx: Context) {
  try {
    const { slug, id } = ctx.params;
    const { status, notes } = ctx.request.body as UpdateAppointmentBody;

    if (!status && !notes) {
      ctx.status = 400;
      ctx.body = { error: "No fields to update" };
      return;
    }

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
      ctx.body = { error: "Not authorized to update this appointment" };
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

    // Update fields
    if (status && Object.values(AppointmentStatus).includes(status)) {
      switch (status) {
        case AppointmentStatus.CANCELED:
          appointment.cancel();
          break;
        case AppointmentStatus.COMPLETED:
          appointment.complete();
          break;
        case AppointmentStatus.NO_SHOW:
          appointment.markAsNoShow();
          break;
      }
    }
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    // Save changes
    const updatedAppointment = await appointmentRepository.update(appointment);

    ctx.body = {
      id: updatedAppointment.id,
      startTime: updatedAppointment.startTime,
      endTime: updatedAppointment.endTime,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      cancelToken: updatedAppointment.cancelToken,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
}
