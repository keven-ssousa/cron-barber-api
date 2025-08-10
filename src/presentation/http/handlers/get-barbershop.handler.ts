import { Context } from "koa";
import { container } from "tsyringe";
import { GetBarbershopHandler } from "../../../application/barbershop/queries/get-barbershop.query";
import { ScheduleRuleRepository } from "../../../domain/barbershop/repositories/schedule-rule.repository";
import { ServiceRepository } from "../../../domain/barbershop/repositories/service.repository";

export async function handleGetBarbershop(ctx: Context) {
  try {
    const { slug } = ctx.params;

    // Get barbershop details
    const getBarbershopHandler = container.resolve(GetBarbershopHandler);
    const barbershop = await getBarbershopHandler.execute({ slug });

    // Get services
    const serviceRepository =
      container.resolve<ServiceRepository>("ServiceRepository");
    const services = await serviceRepository.findByBarbershopId(
      barbershop.id as number,
    );

    // Get schedule rules
    const scheduleRuleRepository = container.resolve<ScheduleRuleRepository>(
      "ScheduleRuleRepository",
    );
    const scheduleRules = await scheduleRuleRepository.findByBarbershopId(
      barbershop.id as number,
    );

    ctx.body = {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      description: barbershop.description,
      address: barbershop.address,
      logoUrl: barbershop.logoUrl,
      ownerId: barbershop.ownerId,
      timezone: barbershop.timezone,
      createdAt: barbershop.createdAt,
      updatedAt: barbershop.updatedAt,
      services,
      scheduleRules,
    };
  } catch (error: any) {
    console.error("Error fetching barbershop:", error);
    if (error.message.includes("não encontrada")) {
      ctx.status = 404;
      ctx.body = { error: "Barbershop not found" };
      return;
    }
    ctx.status = 500;
    ctx.body = { error: "An unexpected error occurred" };
  }
}
