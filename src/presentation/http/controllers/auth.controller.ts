import Router from "@koa/router";
import { container } from "tsyringe";
import { SignInHandler } from "../../../application/auth/commands/sign-in.command";
import { SignUpHandler } from "../../../application/auth/commands/sign-up.command";
import { AuthService } from "../../../domain/auth/services/auth-service.interface";
import { SignInRequestDto, SignUpRequestDto } from "../dtos/request/auth.dto";

export function createAuthController(): Router {
  const router = new Router({
    prefix: "/auth",
  });

  // POST /auth/signup
  router.post("/signup", async (ctx) => {
    try {
      const requestBody = ctx.request.body as SignUpRequestDto;

      const handler = container.resolve(SignUpHandler);
      const result = await handler.execute({
        email: requestBody.email,
        password: requestBody.password,
        firstName: requestBody.firstName,
        lastName: requestBody.lastName,
      });

      ctx.status = 201;
      ctx.body = result;
    } catch (error: any) {
      console.error("Error during signup:", error);
      ctx.status = 400;
      ctx.body = { error: error.message };
    }
  });

  // POST /auth/signin
  router.post("/signin", async (ctx) => {
    try {
      const requestBody = ctx.request.body as SignInRequestDto;

      const handler = container.resolve(SignInHandler);
      const result = await handler.execute({
        email: requestBody.email,
        password: requestBody.password,
      });

      ctx.body = result;
    } catch (error: any) {
      console.error("Error during signin:", error);
      ctx.status = 401;
      ctx.body = { error: error.message };
    }
  });

  // POST /auth/signout
  router.post("/signout", async (ctx) => {
    try {
      const token = ctx.headers.authorization?.split(" ")[1] || "";

      // Aqui seria ideal criar um caso de uso específico para logout
      const authService = container.resolve<AuthService>("AuthService");
      await authService.signOut(token);

      ctx.status = 204;
    } catch (error: any) {
      console.error("Error during signout:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  return router;
}
