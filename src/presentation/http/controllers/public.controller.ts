import Router from "@koa/router";
import { container } from "tsyringe";
import { CreateAppointmentHandler } from "../../../application/appointment/commands/create-appointment.command";
import { GetAvailableSlotsHandler } from "../../../application/schedule/queries/get-available-slots.query";

export function createPublicController(): Router {
  const router = new Router({
    prefix: "/public/shops",
  });

  // GET /public/shops/:slug/availability
  router.get("/:slug/availability", async (ctx) => {
    try {
      const { slug } = ctx.params;
      const { date, serviceId } = ctx.query;

      if (!date || !serviceId) {
        ctx.status = 400;
        ctx.body = { error: "Data e ID do serviço são obrigatórios" };
        return;
      }

      const handler = container.resolve(GetAvailableSlotsHandler);
      const result = await handler.execute({
        slug,
        date: date as string,
        serviceId: Number(serviceId),
      });

      ctx.body = result;
    } catch (error: any) {
      console.error("Erro ao buscar slots disponíveis:", error);
      ctx.status = error.message.includes("não encontrada") ? 404 : 500;
      ctx.body = { error: error.message };
    }
  });

  // POST /public/shops/:slug/appointments
  router.post("/:slug/appointments", async (ctx) => {
    try {
      const { slug } = ctx.params;
      const { serviceId, customerId, startTime, endTime, notes } = ctx.request
        .body as {
        serviceId: number;
        customerId: number;
        startTime: string;
        endTime: string;
        notes?: string;
      };

      if (!serviceId || !customerId || !startTime || !endTime) {
        ctx.status = 400;
        ctx.body = { error: "Dados incompletos para agendamento" };
        return;
      }

      // Em um cenário real, buscaríamos a barbearia pelo slug
      // e então usaríamos o ID dela no comando
      // Neste exemplo, vamos simular que já temos o ID
      const barbershopId = 1; // Simulado

      const handler = container.resolve(CreateAppointmentHandler);
      const result = await handler.execute({
        barbershopId,
        serviceId: Number(serviceId),
        customerId: Number(customerId),
        startTime,
        endTime,
        notes,
      });

      ctx.status = 201;
      ctx.body = result;
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // GET /public/shops/:slug/cancel/:token
  router.get("/:slug/cancel/:token", async (ctx) => {
    try {
      const { token } = ctx.params;

      // Em um cenário real, teríamos um caso de uso específico para cancelamento
      // Neste exemplo, vamos apenas simular uma resposta
      ctx.body = {
        success: true,
        message: "Agendamento cancelado com sucesso",
      };
    } catch (error: any) {
      console.error("Erro ao cancelar agendamento:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  return router;
}
