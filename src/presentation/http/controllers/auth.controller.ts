import Router from "@koa/router";
import { container } from "tsyringe";
import { SignInHandler } from "../../../application/auth/commands/sign-in.command";
import { SignUpHandler } from "../../../application/auth/commands/sign-up.command";
import { AuthService } from "../../../domain/auth/services/auth-service.interface";
import { SignInRequestDto, SignUpRequestDto } from "../dtos/request/auth.dto";

export function createAuthController(): Router {
  const router = new Router();

  // GET / - Handle root URL for email confirmation
  router.get("/", async (ctx) => {
    try {
      // Check if we have hash parameters in the URL
      const url = new URL(ctx.request.href);
      const hash = url.hash.slice(1); // Remove the # character
      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const type = params.get("type");

      if (access_token && type === "signup") {
        // Redirect to our confirm-email endpoint with the parameters
        const confirmUrl = new URL("/auth/confirm-email", url.origin);
        confirmUrl.searchParams.append("access_token", access_token);
        if (refresh_token) {
          confirmUrl.searchParams.append("refresh_token", refresh_token);
        }
        confirmUrl.searchParams.append("type", type);

        return ctx.redirect(confirmUrl.toString());
      }

      // If no valid parameters, redirect to frontend
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return ctx.redirect(frontendUrl);
    } catch (error: any) {
      console.error("Error handling root URL:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // Auth routes
  const authRouter = new Router({
    prefix: "/auth",
  });

  // POST /auth/signup
  authRouter.post("/signup", async (ctx) => {
    try {
      const requestBody = ctx.request.body as SignUpRequestDto;

      // Validar dados de entrada
      if (
        !requestBody.email ||
        !requestBody.password ||
        !requestBody.firstName ||
        !requestBody.lastName
      ) {
        ctx.status = 400;
        ctx.body = {
          error:
            "Todos os campos são obrigatórios: email, password, firstName, lastName",
        };
        return;
      }

      console.log("Processing signup request for email:", requestBody.email);

      const handler = container.resolve(SignUpHandler);
      const result = await handler.execute({
        email: requestBody.email,
        password: requestBody.password,
        firstName: requestBody.firstName,
        lastName: requestBody.lastName,
      });

      ctx.status = 201;

      // Se o token estiver vazio, significa que a confirmação de email é necessária
      if (!result.token) {
        ctx.body = {
          ...result,
          message:
            "Usuário registrado com sucesso. Por favor, verifique seu email para ativar sua conta.",
        };
      } else {
        ctx.body = result;
      }
    } catch (error: any) {
      console.error("Error during signup:", error);
      ctx.status = 400;
      ctx.body = { error: error.message };
    }
  });

  // POST /auth/signin
  authRouter.post("/signin", async (ctx) => {
    try {
      const requestBody = ctx.request.body as SignInRequestDto;

      // Validar dados de entrada
      if (!requestBody.email || !requestBody.password) {
        ctx.status = 400;
        ctx.body = { error: "Email e senha são obrigatórios" };
        return;
      }

      console.log("Processing signin request for email:", requestBody.email);

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
  authRouter.post("/signout", async (ctx) => {
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

  // POST /auth/resend-confirmation
  authRouter.post("/resend-confirmation", async (ctx) => {
    try {
      const { email } = ctx.request.body as { email: string };

      if (!email) {
        ctx.status = 400;
        ctx.body = { error: "Email é obrigatório" };
        return;
      }

      console.log("Processing resend confirmation request for email:", email);

      const authService = container.resolve<AuthService>("AuthService");
      await authService.resendConfirmationEmail(email);

      ctx.status = 200;
      ctx.body = {
        success: true,
        message:
          "Email de confirmação reenviado com sucesso. Por favor, verifique sua caixa de entrada.",
      };
    } catch (error: any) {
      console.error("Error during resend confirmation:", error);
      ctx.status = 400;
      ctx.body = { error: error.message };
    }
  });

  // GET /auth/confirm-email
  authRouter.get("/confirm-email", async (ctx) => {
    try {
      // Pegando os parâmetros da URL
      const { access_token, refresh_token, type } = ctx.query;

      if (!access_token || type !== "signup") {
        ctx.status = 400;
        ctx.body = { error: "Parâmetros inválidos" };
        return;
      }

      // Validar o token com o Supabase
      const authService = container.resolve<AuthService>("AuthService");
      const user = await authService.validateToken(access_token as string);

      if (!user) {
        ctx.status = 401;
        ctx.body = { error: "Token inválido" };
        return;
      }

      // Se tudo estiver ok, redirecionar para o frontend com os tokens
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const confirmationUrl = new URL("/auth/email-confirmed", frontendUrl);

      // Adicionar parâmetros necessários
      confirmationUrl.searchParams.append(
        "access_token",
        access_token as string,
      );
      if (refresh_token) {
        confirmationUrl.searchParams.append(
          "refresh_token",
          refresh_token as string,
        );
      }
      confirmationUrl.searchParams.append("email", user.email);

      // Redirecionar para o frontend
      ctx.redirect(confirmationUrl.toString());
    } catch (error: any) {
      console.error("Error during email confirmation:", error);

      // Em caso de erro, redirecionar para o frontend com mensagem de erro
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const errorUrl = new URL("/auth/email-confirmation-error", frontendUrl);
      errorUrl.searchParams.append("error", error.message);

      ctx.redirect(errorUrl.toString());
    }
  });

  // GET /auth/verify
  authRouter.get("/verify", async (ctx) => {
    try {
      const { token_hash, type, email } = ctx.query;

      if (!token_hash || !type || !email) {
        ctx.status = 400;
        ctx.body = { error: "Parâmetros inválidos" };
        return;
      }

      const authService = container.resolve<AuthService>("AuthService");

      // Verificar o token com o Supabase
      const result = await authService.verifyEmail(token_hash as string);

      // Se a verificação for bem sucedida, redirecionar para o frontend
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectUrl = new URL("/auth/verification-success", frontendUrl);

      // Adicionar parâmetros necessários
      redirectUrl.searchParams.append("email", email as string);
      redirectUrl.searchParams.append("status", "success");

      ctx.redirect(redirectUrl.toString());
    } catch (error: any) {
      console.error("Error during email verification:", error);

      // Em caso de erro, redirecionar para o frontend com mensagem de erro
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const errorUrl = new URL("/auth/verification-error", frontendUrl);
      errorUrl.searchParams.append("error", error.message);

      ctx.redirect(errorUrl.toString());
    }
  });

  // POST /auth/verify/resend
  authRouter.post("/verify/resend", async (ctx) => {
    try {
      const { email } = ctx.request.body as { email: string };

      if (!email) {
        ctx.status = 400;
        ctx.body = { error: "Email é obrigatório" };
        return;
      }

      const authService = container.resolve<AuthService>("AuthService");
      await authService.resendVerificationEmail(email);

      ctx.status = 200;
      ctx.body = {
        message: "Email de verificação reenviado com sucesso",
      };
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      ctx.status = 400;
      ctx.body = { error: error.message };
    }
  });

  // Mount auth routes on the main router
  router.use(authRouter.routes());
  router.use(authRouter.allowedMethods());

  return router;
}
