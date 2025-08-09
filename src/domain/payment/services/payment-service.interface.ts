export interface CreateCheckoutSessionParams {
  customerId?: string; // ID do cliente no Stripe (opcional)
  customerEmail: string; // Email do cliente
  priceId: string; // ID do preço do produto no Stripe
  successUrl: string; // URL de redirecionamento em caso de sucesso
  cancelUrl: string; // URL de redirecionamento em caso de cancelamento
  metadata?: Record<string, string>; // Metadados adicionais
}

export interface SubscriptionEventData {
  customerId: string; // ID do cliente no Stripe
  customerEmail: string; // Email do cliente
  subscriptionId: string; // ID da assinatura no Stripe
  status: string; // Status da assinatura (active, canceled, etc)
  planId: string; // ID do plano
  priceId: string; // ID do preço
  metadata: Record<string, string>; // Metadados da assinatura
}

export interface PaymentService {
  /**
   * Cria uma sessão de checkout para assinatura
   */
  createSubscriptionCheckout(
    params: CreateCheckoutSessionParams,
  ): Promise<{ url: string; sessionId: string }>;

  /**
   * Verifica se uma assinatura está ativa
   */
  isSubscriptionActive(subscriptionId: string): Promise<boolean>;

  /**
   * Cancela uma assinatura
   */
  cancelSubscription(subscriptionId: string): Promise<void>;

  /**
   * Processa um evento de webhook
   */
  handleWebhookEvent(
    payload: any,
    signature: string,
  ): Promise<{ type: string; data: any }>;
}
