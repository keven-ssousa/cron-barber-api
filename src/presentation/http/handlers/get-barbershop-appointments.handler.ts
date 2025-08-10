import { Context } from "koa";
import { container } from "tsyringe";
import { GetBarbershopHandler } from "../../../application/barbershop/queries/get-barbershop.query";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";

export async function handleGetBarbershopAppointments(ctx: Context) {
  try {
    const { slug } = ctx.params;

    // Get barbershop details
    const getBarbershopHandler = container.resolve(GetBarbershopHandler);
    const barbershop = await getBarbershopHandler.execute({ slug });

    // Get appointments for the barbershop
    const appointmentRepository = container.resolve<AppointmentRepository>(
      "AppointmentRepository",
    );
    const appointments = await appointmentRepository.findByBarbershopId(
      barbershop.id as number,
    );

    // Format response
    ctx.body = appointments.map((appointment) => ({
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      notes: appointment.notes,
      serviceId: appointment.serviceId,
      customerId: appointment.customerId,
      cancelToken: appointment.cancelToken,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    }));
  } catch (error: any) {
    console.error("Error fetching barbershop appointments:", error);
    if (error.message.includes("não encontrada")) {
      ctx.status = 404;
      ctx.body = { error: "Barbershop not found" };
      return;
    }
    ctx.status = 500;
    ctx.body = { error: "An unexpected error occurred" };
  }
}
