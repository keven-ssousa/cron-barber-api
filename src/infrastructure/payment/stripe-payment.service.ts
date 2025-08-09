import Stripe from "stripe";
import { injectable } from "tsyringe";
import {
  CreateCheckoutSessionParams,
  PaymentService,
  SubscriptionEventData,
} from "../../domain/payment/services/payment-service.interface";

@injectable()
export class StripePaymentService implements PaymentService {
  private stripe: Stripe;

  constructor() {
    // A chave secreta deve estar em variáveis de ambiente
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  }

  async createSubscriptionCheckout(
    params: CreateCheckoutSessionParams,
  ): Promise<{ url: string; sessionId: string }> {
    const {
      customerEmail,
      priceId,
      successUrl,
      cancelUrl,
      metadata = {},
    } = params;

    // Criar a sessão de checkout
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    if (!session.url) {
      throw new Error("Não foi possível criar a sessão de checkout");
    }

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async isSubscriptionActive(subscriptionId: string): Promise<boolean> {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    return subscription.status === "active";
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async handleWebhookEvent(
    payload: any,
    signature: string,
  ): Promise<{ type: string; data: any }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    try {
      // Verificar a assinatura do webhook
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      let data: any = {};
      const eventObject = event.data.object as any;

      // Processar diferentes tipos de eventos
      switch (event.type) {
        case "checkout.session.completed":
          // Validar se é uma assinatura
          if (eventObject.mode === "subscription" && eventObject.subscription) {
            const subscription = await this.stripe.subscriptions.retrieve(
              eventObject.subscription as string,
            );

            let customerEmail = eventObject.customer_email || "";

            if (!customerEmail && subscription.customer) {
              const customer = await this.stripe.customers.retrieve(
                subscription.customer as string,
              );

              if (customer && !("deleted" in customer)) {
                customerEmail = customer.email || "";
              }
            }

            data = {
              customerId: subscription.customer,
              customerEmail,
              subscriptionId: subscription.id,
              status: subscription.status,
              // Acesse os dados com verificação de null/undefined
              planId: subscription.items?.data[0]?.plan?.product,
              priceId: subscription.items?.data[0]?.price?.id,
              metadata: subscription.metadata || {},
            } as SubscriptionEventData;
          }
          break;

        case "invoice.payment_succeeded":
          if (eventObject.subscription) {
            const subscription = await this.stripe.subscriptions.retrieve(
              eventObject.subscription as string,
            );

            let customerEmail = "";

            if (subscription.customer) {
              const customer = await this.stripe.customers.retrieve(
                subscription.customer as string,
              );

              if (customer && !("deleted" in customer)) {
                customerEmail = customer.email || "";
              }
            }

            data = {
              customerId: subscription.customer,
              customerEmail,
              subscriptionId: subscription.id,
              status: subscription.status,
              planId: subscription.items?.data[0]?.plan?.product,
              priceId: subscription.items?.data[0]?.price?.id,
              metadata: subscription.metadata || {},
            } as SubscriptionEventData;
          }
          break;

        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as any;

          let customerEmail = "";

          if (subscription.customer) {
            const customer = await this.stripe.customers.retrieve(
              subscription.customer as string,
            );

            if (customer && !("deleted" in customer)) {
              customerEmail = customer.email || "";
            }
          }

          data = {
            customerId: subscription.customer,
            customerEmail,
            subscriptionId: subscription.id,
            status: subscription.status,
            planId: subscription.items?.data[0]?.plan?.product,
            priceId: subscription.items?.data[0]?.price?.id,
            metadata: subscription.metadata || {},
          } as SubscriptionEventData;
          break;
      }

      return {
        type: event.type,
        data,
      };
    } catch (error) {
      console.error("Erro ao processar webhook do Stripe:", error);
      throw new Error("Webhook error: " + (error as Error).message);
    }
  }
}
