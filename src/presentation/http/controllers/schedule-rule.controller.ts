import Router from "@koa/router";
import { Context, DefaultContext, DefaultState, Middleware } from "koa";
import { container } from "tsyringe";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";
import { ScheduleRuleRepository } from "../../../domain/barbershop/repositories/schedule-rule.repository";
import { ScheduleRule } from "../../../domain/common/value-objects/schedule-rule.vo";
import {
  ScheduleRuleDTO,
  mapScheduleRuleToResponse,
} from "../dtos/schedule-rule.dto";
import { authMiddleware } from "../middlewares/auth.middleware";

export function createScheduleRuleController(): Router {
  const router = new Router({
    prefix: "/shops/:shopId/schedule-rules",
  });

  router.use(authMiddleware as Middleware<DefaultState, DefaultContext>);

  // GET /shops/:shopId/schedule-rules - List all schedule rules
  router.get("/", async (ctx: Context) => {
    try {
      const { shopId } = ctx.params;

      // Get barbershop repository
      const barbershopRepository = container.resolve<BarbershopRepository>(
        "BarbershopRepository",
      );

      // Find barbershop
      const barbershop = await barbershopRepository.findById(parseInt(shopId));
      if (!barbershop) {
        ctx.status = 404;
        ctx.body = { error: "Barbershop not found" };
        return;
      }

      // Get schedule rules repository
      const scheduleRuleRepository = container.resolve<ScheduleRuleRepository>(
        "ScheduleRuleRepository",
      );
      const rules = await scheduleRuleRepository.findByBarbershopId(
        barbershop.id!,
      );

      // Return rules grouped by day
      const groupedRules = rules.reduce(
        (acc, rule) => {
          const dayOfWeek = rule.dayOfWeek;
          if (!acc[dayOfWeek]) {
            acc[dayOfWeek] = [];
          }
          acc[dayOfWeek].push(mapScheduleRuleToResponse(rule));
          return acc;
        },
        {} as Record<number, any[]>,
      );

      ctx.body = groupedRules;
    } catch (error: any) {
      console.error("Error fetching schedule rules:", error);
      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  // POST /shops/:shopId/schedule-rules - Create a new schedule rule
  router.post("/", async (ctx: Context) => {
    try {
      const { shopId } = ctx.params;
      const { dayOfWeek, startTime, endTime } = ctx.request
        .body as ScheduleRuleDTO;

      // Get barbershop repository
      const barbershopRepository = container.resolve<BarbershopRepository>(
        "BarbershopRepository",
      );

      // Find barbershop
      const barbershop = await barbershopRepository.findById(parseInt(shopId));
      if (!barbershop || !barbershop.id) {
        ctx.status = 404;
        ctx.body = { error: "Barbershop not found or invalid" };
        return;
      }

      // Check if user is the owner
      if (barbershop.ownerId !== ctx.state.user.id) {
        ctx.status = 403;
        ctx.body = {
          error: "Not authorized to manage this barbershop's schedule rules",
        };
        return;
      }

      // Validate schedule rule
      try {
        // This will throw if validation fails
        new ScheduleRule(dayOfWeek, startTime, endTime);
      } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
        return;
      }

      // Get schedule rule repository
      const scheduleRuleRepository = container.resolve<ScheduleRuleRepository>(
        "ScheduleRuleRepository",
      );

      // Get existing rules for this day
      const existingRules = await scheduleRuleRepository.findByBarbershopAndDay(
        barbershop.id,
        dayOfWeek,
      );

      // Check for time overlap with existing rules
      const newRule = new ScheduleRule(dayOfWeek, startTime, endTime);
      const hasOverlap = existingRules.some((rule) =>
        new ScheduleRule(rule.dayOfWeek, rule.startTime, rule.endTime).overlaps(
          newRule,
        ),
      );

      if (hasOverlap) {
        ctx.status = 400;
        ctx.body = {
          error: "This time interval overlaps with an existing schedule rule",
        };
        return;
      }

      // Get next order number for this day
      const order = existingRules.length;

      // Create schedule rule
      const rule = await scheduleRuleRepository.create({
        dayOfWeek,
        startTime,
        endTime,
        isActive: true,
        order,
        barbershopId: barbershop.id,
      });

      // Return created rule
      ctx.status = 201;
      ctx.body = mapScheduleRuleToResponse(rule);
    } catch (error: any) {
      console.error("Error creating schedule rule:", error);
      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  // PUT /shops/:shopId/schedule-rules/:id - Update a schedule rule
  router.put("/:id", async (ctx: Context) => {
    try {
      const { shopId, id } = ctx.params;
      const { dayOfWeek, startTime, endTime, isActive } = ctx.request
        .body as ScheduleRuleDTO;

      // Get barbershop repository
      const barbershopRepository = container.resolve<BarbershopRepository>(
        "BarbershopRepository",
      );

      // Find barbershop
      const barbershop = await barbershopRepository.findById(parseInt(shopId));
      if (!barbershop) {
        ctx.status = 404;
        ctx.body = { error: "Barbershop not found" };
        return;
      }

      // Check if user is the owner
      if (barbershop.ownerId !== ctx.state.user.id) {
        ctx.status = 403;
        ctx.body = {
          error: "Not authorized to manage this barbershop's schedule rules",
        };
        return;
      }

      // Get schedule rule repository
      const scheduleRuleRepository = container.resolve<ScheduleRuleRepository>(
        "ScheduleRuleRepository",
      );

      // Find schedule rule
      const existingRule = await scheduleRuleRepository.findById(parseInt(id));
      if (!existingRule || existingRule.barbershopId !== barbershop.id) {
        ctx.status = 404;
        ctx.body = { error: "Schedule rule not found" };
        return;
      }

      // Validate new schedule rule data if provided
      if (
        dayOfWeek !== undefined ||
        startTime !== undefined ||
        endTime !== undefined
      ) {
        try {
          new ScheduleRule(
            dayOfWeek ?? existingRule.dayOfWeek,
            startTime ?? existingRule.startTime,
            endTime ?? existingRule.endTime,
          );
        } catch (error: any) {
          ctx.status = 400;
          ctx.body = { error: error.message };
          return;
        }
      }

      // If day of week is being changed, check for conflicts
      if (dayOfWeek !== undefined && dayOfWeek !== existingRule.dayOfWeek) {
        const conflictingRule =
          await scheduleRuleRepository.findByBarbershopAndDay(
            barbershop.id!,
            dayOfWeek,
          );

        if (conflictingRule) {
          ctx.status = 400;
          ctx.body = {
            error: "A schedule rule already exists for this day",
          };
          return;
        }
      }

      // Update schedule rule
      const updated = await scheduleRuleRepository.update(parseInt(id), {
        dayOfWeek,
        startTime,
        endTime,
        isActive,
      });

      // Return updated rule
      ctx.body = {
        ...updated,
        dayName: new ScheduleRule(
          updated.dayOfWeek,
          updated.startTime,
          updated.endTime,
          updated.isActive,
        ).getDayName(),
      };
    } catch (error: any) {
      console.error("Error updating schedule rule:", error);
      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  // DELETE /shops/:shopId/schedule-rules/:id - Delete a schedule rule
  router.delete("/:id", async (ctx: Context) => {
    try {
      const { shopId, id } = ctx.params;

      // Get barbershop repository
      const barbershopRepository = container.resolve<BarbershopRepository>(
        "BarbershopRepository",
      );

      // Find barbershop
      const barbershop = await barbershopRepository.findById(parseInt(shopId));
      if (!barbershop) {
        ctx.status = 404;
        ctx.body = { error: "Barbershop not found" };
        return;
      }

      // Check if user is the owner
      if (barbershop.ownerId !== ctx.state.user.id) {
        ctx.status = 403;
        ctx.body = {
          error: "Not authorized to manage this barbershop's schedule rules",
        };
        return;
      }

      // Get schedule rule repository
      const scheduleRuleRepository = container.resolve<ScheduleRuleRepository>(
        "ScheduleRuleRepository",
      );

      // Find schedule rule
      const rule = await scheduleRuleRepository.findById(parseInt(id));
      if (!rule || rule.barbershopId !== barbershop.id) {
        ctx.status = 404;
        ctx.body = { error: "Schedule rule not found" };
        return;
      }

      // Delete schedule rule
      await scheduleRuleRepository.delete(parseInt(id));

      ctx.status = 204;
    } catch (error: any) {
      console.error("Error deleting schedule rule:", error);
      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  return router;
}
