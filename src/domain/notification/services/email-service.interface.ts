export interface EmailService {
  /**
   * Envia um email de convite para cadastro
   */
  sendBarberSignupInvite(
    email: string,
    data: BarberSignupInviteData,
  ): Promise<void>;

  /**
   * Envia um email de confirmação de assinatura
   */
  sendSubscriptionConfirmation(
    email: string,
    data: SubscriptionConfirmationData,
  ): Promise<void>;

  /**
   * Envia um email de alerta sobre falha no pagamento
   */
  sendPaymentFailureAlert(
    email: string,
    data: PaymentFailureData,
  ): Promise<void>;
}

export interface BarberSignupInviteData {
  inviteToken: string;
  signupUrl: string;
  planName: string;
  expirationDate?: Date;
}

export interface SubscriptionConfirmationData {
  planName: string;
  nextBillingDate?: Date;
  amount: string;
  receiptUrl?: string;
}

export interface PaymentFailureData {
  planName: string;
  amount: string;
  retryDate?: Date;
  updatePaymentUrl: string;
}
