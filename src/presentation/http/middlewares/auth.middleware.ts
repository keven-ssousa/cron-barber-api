import { Context, Next } from "koa";
import { container } from "tsyringe";
import { AuthService } from "../../../domain/auth/services/auth-service.interface";

export async function authMiddleware(ctx: Context, next: Next) {
  try {
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.status = 401;
      ctx.body = { error: "Authentication required" };
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const authService = container.resolve<AuthService>("AuthService");

    try {
      const user = await authService.validateToken(token);

      // Add user to context state
      ctx.state.user = user;

      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = { error: "Invalid or expired token" };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Internal server error" };
  }
}
