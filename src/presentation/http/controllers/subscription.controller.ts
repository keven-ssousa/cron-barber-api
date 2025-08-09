import Router from "@koa/router";
import { randomBytes } from "crypto";
import { Context } from "koa";
import { container } from "tsyringe";

import {
  BarberSignupInviteData,
  EmailService,
} from "../../../domain/notification/services/email-service.interface";
import { PaymentService } from "../../../domain/payment/services/payment-service.interface";

// Interface para o serviço de tokens de convite
interface InviteTokenService {
  createToken(email: string, metadata: any): Promise<string>;
  validateToken(
    token: string,
  ): Promise<{ email: string; metadata: any } | null>;
}

// Implementação temporária simples de tokens
class SimpleInviteTokenService implements InviteTokenService {
  private tokens: Map<
    string,
    { email: string; metadata: any; expiresAt: Date }
  > = new Map();

  async createToken(email: string, metadata: any): Promise<string> {
    // Gerar token aleatório
    const token = randomBytes(32).toString("hex");

    // Definir data de expiração (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Armazenar token com metadados
    this.tokens.set(token, { email, metadata, expiresAt });

    return token;
  }

  async validateToken(
    token: string,
  ): Promise<{ email: string; metadata: any } | null> {
    const tokenData = this.tokens.get(token);

    // Verificar se o token existe e não expirou
    if (!tokenData || tokenData.expiresAt < new Date()) {
      return null;
    }

    // Token válido, remover após uso
    this.tokens.delete(token);

    return {
      email: tokenData.email,
      metadata: tokenData.metadata,
    };
  }
}

// Registrar o serviço de tokens no container
container.registerSingleton<InviteTokenService>(
  "InviteTokenService",
  SimpleInviteTokenService,
);

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
      const inviteTokenService =
        container.resolve<InviteTokenService>("InviteTokenService");

      // Obter o corpo bruto da requisição
      const payload = ctx.request.body; // Considere que o body já está como string

      // Processar o evento
      const result = await paymentService.handleWebhookEvent(
        payload,
        signature,
      );

      // Lidar com diferentes tipos de eventos
      if (result.type === "checkout.session.completed") {
        const { customerEmail, metadata } = result.data;

        // Verificar se é uma nova assinatura de barbeiro
        if (metadata && metadata.isNewBarber === "true") {
          // Criar token de convite
          const inviteToken = await inviteTokenService.createToken(
            customerEmail,
            {
              subscriptionId: result.data.subscriptionId,
              planId: result.data.planId,
            },
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

      const inviteTokenService =
        container.resolve<InviteTokenService>("InviteTokenService");
      const result = await inviteTokenService.validateToken(token as string);

      if (!result) {
        ctx.status = 400;
        ctx.body = { valid: false, error: "Token inválido ou expirado" };
        return;
      }

      ctx.body = {
        valid: true,
        email: result.email,
        subscriptionId: result.metadata.subscriptionId,
      };
    } catch (error: any) {
      console.error("Erro ao validar token:", error);
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  });

  return router;
}
