import Router from "@koa/router";
import { Context } from "koa";
import { container } from "tsyringe";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";

export function createBarbershopAppointmentsController(): Router {
  const router = new Router({
    prefix: "/barbershops/:slug/appointments",
  });

  // GET /barbershops/:slug/appointments - List all appointments
  router.get("/", async (ctx: Context) => {
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
      if (status) {
        filteredAppointments = appointments.filter(
          (app) => app.status === status,
        );
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        filteredAppointments = filteredAppointments.filter(
          (app) => app.startTime >= start && app.startTime <= end,
        );
      }

      ctx.body = filteredAppointments;
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // GET /barbershops/:slug/appointments/:id - Get specific appointment
  router.get("/:id", async (ctx: Context) => {
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

      ctx.body = appointment;
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // PUT /barbershops/:slug/appointments/:id - Update appointment
  router.put("/:id", async (ctx: Context) => {
    try {
      const { slug, id } = ctx.params;
      const { status, notes } = ctx.request.body;

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

      // Update appointment
      if (status) appointment.status = status;
      if (notes) appointment.notes = notes;

      const updatedAppointment =
        await appointmentRepository.update(appointment);
      ctx.body = updatedAppointment;
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // DELETE /barbershops/:slug/appointments/:id - Delete/Cancel appointment
  router.delete("/:id", async (ctx: Context) => {
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
        ctx.body = { error: "Not authorized to delete this appointment" };
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

      // Delete appointment
      await appointmentRepository.delete(Number(id));
      ctx.status = 204;
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  return router;
}
