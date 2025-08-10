/**
 * Interface para o serviço de convites de assinatura
 */
export interface SubscriptionInviteService {
  /**
   * Cria um convite para um novo usuário com base em uma assinatura
   * @param email Email do usuário convidado
   * @param subscriptionId ID da assinatura
   * @param expiresInHours Horas até a expiração do convite (padrão: 24)
   * @returns Token do convite
   */
  createInvite(
    email: string,
    subscriptionId: string,
    expiresInHours?: number,
  ): Promise<string>;

  /**
   * Valida um token de convite
   * @param token Token do convite
   * @returns Dados do convite se válido, null se inválido
   */
  validateInvite(token: string): Promise<{
    email: string;
    subscriptionId: string;
    inviteId: string;
  } | null>;

  /**
   * Marca um convite como utilizado
   * @param inviteId ID do convite
   * @returns true se bem sucedido
   */
  markInviteAsUsed(inviteId: string): Promise<boolean>;
}
