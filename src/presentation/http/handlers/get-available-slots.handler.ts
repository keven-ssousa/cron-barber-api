import { Context } from "koa";
import { container } from "tsyringe";
import { GetAvailableSlotsHandler } from "../../../application/schedule/queries/get-available-slots.query";

export async function handleGetAvailableSlots(ctx: Context) {
  const { slug } = ctx.params;
  const { date, serviceId } = ctx.query;

  if (!date || !serviceId) {
    ctx.status = 400;
    ctx.body = {
      error: "Missing required query parameters: date and serviceId",
    };
    return;
  }

  try {
    const handler = container.resolve(GetAvailableSlotsHandler);
    const result = await handler.execute({
      slug,
      date: date as string,
      serviceId: Number(serviceId),
    });

    ctx.body = result;
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
}
