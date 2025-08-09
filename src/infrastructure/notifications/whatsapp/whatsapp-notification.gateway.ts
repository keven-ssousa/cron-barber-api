import axios from "axios";
import { injectable } from "tsyringe";
import {
  NotificationContent,
  NotificationGateway,
  NotificationType,
} from "../../../domain/notification/interfaces/notification-gateway.interface";

@injectable()
export class WhatsAppNotificationGateway implements NotificationGateway {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    // Em um cenário real, isso viria de uma configuração
    this.apiKey = process.env.WHATSAPP_API_KEY || "";
    this.apiUrl = process.env.WHATSAPP_API_URL || "";
  }

  async send(
    recipient: string,
    type: NotificationType,
    content: NotificationContent,
  ): Promise<boolean> {
    try {
      // Aqui implementaria a integração com a API do WhatsApp Business
      if (!this.apiKey || !this.apiUrl) {
        console.warn("WhatsApp API configuration is missing");
        return false;
      }

      const formattedPhoneNumber = this.formatPhoneNumber(recipient);

      // Implementação simulada - em um ambiente real, isso enviaria para a API do WhatsApp
      console.log(
        `[WhatsApp] Sending to ${formattedPhoneNumber}: ${content.title} - ${content.body}`,
      );

      // Simulação de chamada à API
      if (process.env.NODE_ENV !== "test") {
        await axios.post(
          this.apiUrl,
          {
            recipient: formattedPhoneNumber,
            type,
            message: {
              title: content.title,
              body: content.body,
              data: content.data,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        );
      }

      return true;
    } catch (error) {
      console.error("Erro ao enviar notificação WhatsApp:", error);
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove caracteres não-numéricos
    return phoneNumber.replace(/\D/g, "");
  }
}
