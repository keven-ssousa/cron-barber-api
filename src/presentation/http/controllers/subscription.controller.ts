import Router from "@koa/router";
import { Context } from "koa";
import { container } from "tsyringe";

import { CreateAccountFromInviteHandler } from "../../../application/auth/commands/create-account-from-invite.command";
import {
  BarberSignupInviteData,
  EmailService,
} from "../../../domain/notification/services/email-service.interface";
import { PaymentService } from "../../../domain/payment/services/payment-service.interface";
import { SubscriptionInviteService } from "../../../domain/subscription/services/subscription-invite-service.interface";

export function createSubscriptionController(): Router {
  const router = new Router({
    prefix: "/subscriptions",
  });

  // POST /subscriptions/checkout - Criar sessão de checkout
  router.post("/checkout", async (ctx: Context) => {
    try {
      const { email, priceId, successUrl, cancelUrl } = ctx.request.body as {
        email: string;
        priceId: string;
        successUrl: string;
        cancelUrl: string;
      };

      if (!email || !priceId || !successUrl || !cancelUrl) {
        ctx.status = 400;
        ctx.body = { error: "Parâmetros incompletos" };
        return;
      }

      const paymentService =
        container.resolve<PaymentService>("PaymentService");

      // Metadata para o checkout
      const metadata = {
        email,
        isNewBarber: "true", // Indica que é um novo barbeiro
      };

      const checkout = await paymentService.createSubscriptionCheckout({
        customerEmail: email,
        priceId,
        successUrl,
        cancelUrl,
        metadata,
      });

      ctx.body = checkout;
    } catch (error: any) {
      console.error("Erro ao criar checkout:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // POST /subscriptions/webhook - Webhook para eventos do Stripe
  router.post("/webhook", async (ctx: Context) => {
    try {
      const signature = ctx.headers["stripe-signature"] as string;
      if (!signature) {
        ctx.status = 400;
        ctx.body = { error: "Assinatura do webhook não fornecida" };
        return;
      }

      const paymentService =
        container.resolve<PaymentService>("PaymentService");
      const emailService = container.resolve<EmailService>("EmailService");
      const subscriptionInviteService =
        container.resolve<SubscriptionInviteService>(
          "SubscriptionInviteService",
        );

      // Obter o corpo bruto da requisição
      const payload = ctx.request.body; // Considere que o body já está como string

      // Processar o evento
      const result = await paymentService.handleWebhookEvent(
        payload,
        signature,
      );

      // Lidar com diferentes tipos de eventos
      if (result.type === "checkout.session.completed") {
        const { customerEmail, metadata, subscriptionId } = result.data;

        // Verificar se é uma nova assinatura de barbeiro
        if (metadata && metadata.isNewBarber === "true" && subscriptionId) {
          // Criar token de convite
          const inviteToken = await subscriptionInviteService.createInvite(
            customerEmail,
            subscriptionId,
            24, // 24 horas para expiração,
          );

          // Configurar dados para o email de convite
          const signupInviteData: BarberSignupInviteData = {
            inviteToken,
            signupUrl: `${process.env.APP_URL || "http://localhost:3000"}/barber/signup`,
            planName: "Plano Profissional", // Idealmente buscar do banco de dados
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          };

          // Enviar email de convite
          await emailService.sendBarberSignupInvite(
            customerEmail,
            signupInviteData,
          );
        }
      } else if (result.type === "invoice.payment_succeeded") {
        // Processar pagamento de fatura com sucesso
        const { customerEmail } = result.data;

        // Enviar confirmação de pagamento
        await emailService.sendSubscriptionConfirmation(customerEmail, {
          planName: "Plano Profissional", // Idealmente buscar do banco de dados
          amount: "R$ 39,90", // Idealmente buscar do evento
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        });
      } else if (result.type === "invoice.payment_failed") {
        // Processar falha de pagamento
        const { customerEmail } = result.data;

        // Enviar alerta de falha
        await emailService.sendPaymentFailureAlert(customerEmail, {
          planName: "Plano Profissional", // Idealmente buscar do banco de dados
          amount: "R$ 39,90", // Idealmente buscar do evento
          updatePaymentUrl: `${process.env.APP_URL || "http://localhost:3000"}/payment/update`,
        });
      }

      ctx.status = 200;
      ctx.body = { received: true };
    } catch (error: any) {
      console.error("Erro ao processar webhook:", error);
      ctx.status = 400;
      ctx.body = { error: error.message };
    }
  });

  // GET /subscriptions/validate-invite - Validar token de convite
  router.get("/validate-invite", async (ctx: Context) => {
    try {
      const { token } = ctx.query;

      if (!token) {
        ctx.status = 400;
        ctx.body = { error: "Token não fornecido" };
        return;
      }

      const subscriptionInviteService =
        container.resolve<SubscriptionInviteService>(
          "SubscriptionInviteService",
        );
      const result = await subscriptionInviteService.validateInvite(
        token as string,
      );

      if (!result) {
        ctx.status = 400;
        ctx.body = { valid: false, error: "Token inválido ou expirado" };
        return;
      }

      ctx.body = {
        valid: true,
        email: result.email,
        subscriptionId: result.subscriptionId,
      };
    } catch (error: any) {
      console.error("Erro ao validar token:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  // POST /subscriptions/create-account - Criar conta a partir de um convite
  router.post("/create-account", async (ctx: Context) => {
    try {
      const {
        token,
        password,
        firstName,
        lastName,
        barbershopName,
        barbershopSlug,
      } = ctx.request.body as {
        token: string;
        password: string;
        firstName: string;
        lastName: string;
        barbershopName: string;
        barbershopSlug: string;
      };

      if (
        !token ||
        !password ||
        !firstName ||
        !lastName ||
        !barbershopName ||
        !barbershopSlug
      ) {
        ctx.status = 400;
        ctx.body = { error: "Parâmetros incompletos" };
        return;
      }

      // Resolver o handler para criar conta a partir de convite
      const createAccountHandler =
        container.resolve<CreateAccountFromInviteHandler>(
          "CreateAccountFromInviteHandler",
        );

      try {
        // Executar o comando
        const result = await createAccountHandler.execute({
          token,
          password,
          firstName,
          lastName,
          barbershopName,
          barbershopSlug,
        });

        ctx.status = 201;
        ctx.body = {
          success: true,
          message: "Conta criada com sucesso",
          userId: result.userId,
          barbershopId: result.barbershopId,
          token: result.token,
        };
      } catch (cmdError: any) {
        ctx.status = 400;
        ctx.body = { error: cmdError.message };
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  return router;
}
