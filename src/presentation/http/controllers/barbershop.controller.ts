import Router from "@koa/router";
import { Context, DefaultContext, DefaultState, Middleware } from "koa";
import { container } from "tsyringe";
import { authMiddleware } from "../middlewares/auth.middleware";

export function createBarbershopController(): Router {
  const router = new Router({
    prefix: "/shops",
  });

  // Apply auth middleware to all routes
  router.use(authMiddleware as Middleware<DefaultState, DefaultContext>);

  // GET /shops - Get all shops for the current user
  router.get("/", async (ctx: Context) => {
    try {
      // In a real implementation, we would use a proper use case handler
      const barbershopRepository = container.resolve<any>(
        "BarbershopRepository",
      );
      const shops = await barbershopRepository.findByOwnerId(ctx.state.user.id);

      ctx.body = shops;
    } catch (error: any) {
      console.error("Error fetching barbershops:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // Interface para o corpo da requisição de criar/atualizar barbearia
  interface BarbershopRequestBody {
    name?: string;
    slug?: string;
    description?: string;
    address?: string;
    logoUrl?: string;
    timezone?: string;
  }

  // POST /shops - Create a new barbershop
  router.post("/", async (ctx: Context) => {
    try {
      const { name, slug, description, address, logoUrl, timezone } = ctx
        .request.body as BarbershopRequestBody;

      if (!name || !slug) {
        ctx.status = 400;
        ctx.body = { error: "Name and slug are required" };
        return;
      }

      // In a real implementation, we would use a proper use case handler
      const barbershopRepository = container.resolve<any>(
        "BarbershopRepository",
      );

      // Check if slug is already taken
      const existingShop = await barbershopRepository.findBySlug(slug);
      if (existingShop) {
        ctx.status = 409;
        ctx.body = { error: "Slug is already taken" };
        return;
      }

      // Ensure user exists in local database
      const prismaUserRepository = container.resolve<any>(
        "PrismaUserRepository",
      );
      let user = await prismaUserRepository.findById(ctx.state.user.id);

      if (!user) {
        // Create user in local database if doesn't exist
        user = await prismaUserRepository.create({
          id: ctx.state.user.id,
          email: ctx.state.user.email,
          name:
            ctx.state.user.user_metadata?.name ||
            ctx.state.user.email.split("@")[0],
        });
      }

      // Create new barbershop
      const barbershop = {
        name,
        slug,
        description,
        address,
        logoUrl,
        ownerId: ctx.state.user.id,
        timezone: timezone || "UTC",
      };

      const created = await barbershopRepository.create(barbershop);

      ctx.status = 201;
      ctx.body = created;
    } catch (error: any) {
      console.error("Error creating barbershop:", {
        error,
        userId: ctx.state.user.id,
        requestBody: ctx.request.body,
        errorName: error.name,
        errorCode: error.code,
      });

      if (
        error.name === "PrismaClientKnownRequestError" &&
        error.code === "P2003"
      ) {
        ctx.status = 400;
        ctx.body = {
          error:
            "Failed to create barbershop. Please try again or contact support.",
        };
        return;
      }

      ctx.status = 500;
      ctx.body = {
        error: "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      };
    }
  });

  // GET /shops/:id - Get a specific barbershop
  router.get("/:id", async (ctx: Context) => {
    try {
      const { id } = ctx.params;

      // In a real implementation, we would use a proper use case handler
      const barbershopRepository = container.resolve<any>(
        "BarbershopRepository",
      );
      const shop = await barbershopRepository.findById(parseInt(id));

      if (!shop) {
        ctx.status = 404;
        ctx.body = { error: "Barbershop not found" };
        return;
      }

      // Check if the user is the owner
      if (shop.ownerId !== ctx.state.user.id) {
        ctx.status = 403;
        ctx.body = { error: "Not authorized to access this barbershop" };
        return;
      }

      ctx.body = shop;
    } catch (error: any) {
      console.error("Error fetching barbershop:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // PUT /shops/:id - Update a barbershop
  router.put("/:id", async (ctx: Context) => {
    try {
      const { id } = ctx.params;
      const { name, slug, description, address, logoUrl, timezone } = ctx
        .request.body as BarbershopRequestBody;

      // In a real implementation, we would use a proper use case handler
      const barbershopRepository = container.resolve<any>(
        "BarbershopRepository",
      );

      // Check if barbershop exists
      const shop = await barbershopRepository.findById(parseInt(id));
      if (!shop) {
        ctx.status = 404;
        ctx.body = { error: "Barbershop not found" };
        return;
      }

      // Check if the user is the owner
      if (shop.ownerId !== ctx.state.user.id) {
        ctx.status = 403;
        ctx.body = { error: "Not authorized to update this barbershop" };
        return;
      }

      // If slug is being changed, check if the new slug is available
      if (slug && slug !== shop.slug) {
        const existingShop = await barbershopRepository.findBySlug(slug);
        if (existingShop && existingShop.id !== parseInt(id)) {
          ctx.status = 409;
          ctx.body = { error: "Slug is already taken" };
          return;
        }
      }

      // Update barbershop
      const updated = await barbershopRepository.update({
        ...shop,
        name: name || shop.name,
        slug: slug || shop.slug,
        description: description !== undefined ? description : shop.description,
        address: address !== undefined ? address : shop.address,
        logoUrl: logoUrl !== undefined ? logoUrl : shop.logoUrl,
        timezone: timezone || shop.timezone,
      });

      ctx.body = updated;
    } catch (error: any) {
      console.error("Error updating barbershop:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  return router;
}
