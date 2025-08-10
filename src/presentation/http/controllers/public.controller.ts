import Router from "@koa/router";
import { handleCancelAppointment } from "../handlers/cancel-appointment.handler";
import { handleCreateAppointment } from "../handlers/create-appointment.handler";
import { handleGetAvailableSlots } from "../handlers/get-available-slots.handler";
import { handleGetBarbershop } from "../handlers/get-barbershop.handler";

export function createPublicController(): Router {
  const router = new Router({
    prefix: "/public/shops",
  });

  // GET /public/shops/:slug - Get barbershop by slug
  router.get("/:slug", handleGetBarbershop);

  // GET /public/shops/:slug/availability
  router.get("/:slug/availability", handleGetAvailableSlots);

  // POST /public/shops/:slug/appointments
  router.post("/:slug/appointments", handleCreateAppointment);

  // GET /public/shops/:slug/cancel/:token
  router.get("/:slug/cancel/:token", handleCancelAppointment);

  return router;
}
