import Router from "@koa/router";
import { Context, DefaultContext, DefaultState, Middleware } from "koa";
import { container } from "tsyringe";
import { Service } from "../../../domain/barbershop/entities/service.entity";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";
import { ServiceRepository } from "../../../domain/barbershop/repositories/service.repository";
import { Money } from "../../../domain/common/value-objects/money.vo";
import { authMiddleware } from "../middlewares/auth.middleware";

interface CreateServiceDTO {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

export function createServiceController(): Router {
  const router = new Router({
    prefix: "/shops/:shopId/services",
  });

  // Apply auth middleware to all routes
  router.use(authMiddleware as Middleware<DefaultState, DefaultContext>);

  // POST /shops/:shopId/services - Create a new service
  router.post("/", async (ctx: Context) => {
    try {
      const { shopId } = ctx.params;
      const { name, description, price, durationMinutes } = ctx.request
        .body as CreateServiceDTO;

      // Validate required fields
      if (!name || !price || !durationMinutes) {
        ctx.status = 400;
        ctx.body = { error: "Name, price and duration are required" };
        return;
      }

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
          error: "Not authorized to manage this barbershop's services",
        };
        return;
      }

      // Create new service
      const serviceRepository =
        container.resolve<ServiceRepository>("ServiceRepository");

      const service = new Service({
        name,
        description,
        price: new Money(price),
        durationMinutes,
        barbershopId: barbershop.id, // Now we know barbershop.id is defined
        isActive: true,
      });

      // Save service in the database
      const created = await serviceRepository.create(service);

      // Return the created service
      ctx.status = 201;
      ctx.body = service;
    } catch (error: any) {
      console.error("Error creating service:", {
        error,
        userId: ctx.state.user.id,
        requestBody: ctx.request.body,
      });

      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  // GET /shops/:shopId/services - List all services
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

      if (!barbershop.id) {
        ctx.status = 404;
        ctx.body = { error: "Invalid barbershop ID" };
        return;
      }

      // Get services from repository
      const serviceRepository =
        container.resolve<ServiceRepository>("ServiceRepository");
      const services = await serviceRepository.findByBarbershopId(
        barbershop.id,
      );

      // Return services
      ctx.body = services;
    } catch (error: any) {
      console.error("Error fetching services:", error);
      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  // PUT /shops/:shopId/services/:id - Update a service
  router.put("/:id", async (ctx: Context) => {
    try {
      const { shopId, id } = ctx.params;
      const { name, description, price, durationMinutes, isActive } = ctx
        .request.body as CreateServiceDTO & { isActive?: boolean };

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
          error: "Not authorized to manage this barbershop's services",
        };
        return;
      }

      // Get service repository
      const serviceRepository =
        container.resolve<ServiceRepository>("ServiceRepository");

      // Find service
      const service = await serviceRepository.findById(parseInt(id));
      if (!service || service.barbershopId !== barbershop.id) {
        ctx.status = 404;
        ctx.body = { error: "Service not found" };
        return;
      }

      // Update service
      if (name) service.name = name;
      if (description !== undefined) service.description = description;
      if (price) service.price = new Money(price);
      if (durationMinutes) service.durationMinutes = durationMinutes;
      if (isActive !== undefined) service.isActive = isActive;

      // Save updated service
      const updated = await serviceRepository.update(service);

      // Return the updated service
      ctx.body = service;
    } catch (error: any) {
      console.error("Error updating service:", error);
      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  // DELETE /shops/:shopId/services/:id - Delete a service
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
          error: "Not authorized to manage this barbershop's services",
        };
        return;
      }

      // Get service repository
      const serviceRepository =
        container.resolve<ServiceRepository>("ServiceRepository");

      // Find service
      const service = await serviceRepository.findById(parseInt(id));
      if (!service || service.barbershopId !== barbershop.id) {
        ctx.status = 404;
        ctx.body = { error: "Service not found" };
        return;
      }

      // Delete service
      await serviceRepository.delete(service.id!);

      ctx.status = 204;
    } catch (error: any) {
      console.error("Error deleting service:", error);
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
