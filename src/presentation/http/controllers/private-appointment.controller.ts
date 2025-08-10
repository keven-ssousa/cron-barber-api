import Router from "@koa/router";
import { DefaultContext, DefaultState, Middleware } from "koa";
import { handleCancelAppointment } from "../handlers/cancel-appointment.handler";
import { handleGetAppointment } from "../handlers/get-appointment.handler";
import { handleListAppointments } from "../handlers/list-appointments.handler";
import { handleUpdateAppointment } from "../handlers/update-appointment.handler";
import { authMiddleware } from "../middlewares/auth.middleware";

export function createPrivateAppointmentController(): Router {
  const router = new Router({
    prefix: "/barbershops/:slug/appointments",
  });

  // Apply auth middleware to all routes
  router.use(authMiddleware as Middleware<DefaultState, DefaultContext>);

  // GET /barbershops/:slug/appointments
  router.get("/", handleListAppointments);

  // GET /barbershops/:slug/appointments/:id
  router.get("/:id", handleGetAppointment);

  // PUT /barbershops/:slug/appointments/:id
  router.put("/:id", handleUpdateAppointment);

  // DELETE /barbershops/:slug/appointments/:id
  router.delete("/:id", handleCancelAppointment);

  return router;
}
