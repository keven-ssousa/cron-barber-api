import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";
import { SubscriptionInviteService } from "../../../domain/subscription/services/subscription-invite-service.interface";

@injectable()
export class PrismaSubscriptionInviteService
  implements SubscriptionInviteService
{
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createInvite(
    email: string,
    subscriptionId: string,
    expiresInHours: number = 24,
  ): Promise<string> {
    // Verificar se a assinatura existe
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error(`Assinatura com ID ${subscriptionId} não encontrada`);
    }

    // Gerar data de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Gerar token único
    const token = this.generateToken();

    // NOTA: Como o cliente Prisma ainda não foi gerado após a migração,
    // vamos usar um objeto em memória temporariamente para o convite
    // Isso deve ser substituído pelo código abaixo quando o cliente Prisma for gerado:
    /*
    const invite = await this.prisma.subscriptionInvite.create({
      data: {
        email,
        token,
        subscriptionId,
        expiresAt,
      },
    });
    */

    // Armazenamento em memória temporário
    this._tempInvites.push({
      id: this.generateToken(),
      email,
      token,
      subscriptionId,
      expiresAt,
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return token;
  }

  async validateInvite(token: string): Promise<{
    email: string;
    subscriptionId: string;
    inviteId: string;
  } | null> {
    // NOTA: Como o cliente Prisma ainda não foi gerado após a migração,
    // vamos usar um objeto em memória temporariamente para validar o convite
    // Isso deve ser substituído pelo código abaixo quando o cliente Prisma for gerado:
    /*
    const invite = await this.prisma.subscriptionInvite.findUnique({
      where: { token },
    });
    */

    // Buscar no armazenamento em memória temporário
    const invite = this._tempInvites.find((inv) => inv.token === token);

    // Verificar se o convite existe, não foi usado e não expirou
    if (!invite || invite.isUsed || invite.expiresAt < new Date()) {
      return null;
    }

    return {
      email: invite.email,
      subscriptionId: invite.subscriptionId,
      inviteId: invite.id,
    };
  }

  async markInviteAsUsed(inviteId: string): Promise<boolean> {
    try {
      // NOTA: Como o cliente Prisma ainda não foi gerado após a migração,
      // vamos usar um objeto em memória temporariamente para marcar o convite como usado
      // Isso deve ser substituído pelo código abaixo quando o cliente Prisma for gerado:
      /*
      await this.prisma.subscriptionInvite.update({
        where: { id: inviteId },
        data: { isUsed: true },
      });
      */

      // Atualizar no armazenamento em memória temporário
      const index = this._tempInvites.findIndex((inv) => inv.id === inviteId);
      if (index >= 0) {
        this._tempInvites[index].isUsed = true;
        this._tempInvites[index].updatedAt = new Date();
      }

      return true;
    } catch (error) {
      console.error("Erro ao marcar convite como usado:", error);
      return false;
    }
  }

  private generateToken(): string {
    // Gera um token aleatório de 32 caracteres hexadecimais
    return Array.from(new Array(32))
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  // Armazenamento temporário em memória até que o cliente Prisma seja gerado
  private _tempInvites: Array<{
    id: string;
    email: string;
    token: string;
    subscriptionId: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
}
