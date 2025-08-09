import nodemailer from "nodemailer";
import { injectable } from "tsyringe";
import {
  BarberSignupInviteData,
  EmailService,
  PaymentFailureData,
  SubscriptionConfirmationData,
} from "../../../domain/notification/services/email-service.interface";

@injectable()
export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração deve vir de variáveis de ambiente
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });
  }

  async sendBarberSignupInvite(
    email: string,
    data: BarberSignupInviteData,
  ): Promise<void> {
    const { inviteToken, signupUrl, planName, expirationDate } = data;

    // Construir a URL de cadastro com o token
    const fullSignupUrl = `${signupUrl}?token=${inviteToken}`;

    // Conteúdo do email com formato HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bem-vindo ao BarberFlow!</h1>
        <p>Parabéns pela sua assinatura do plano <strong>${planName}</strong>!</p>
        <p>Para completar seu cadastro e começar a usar a plataforma, clique no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${fullSignupUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Completar Meu Cadastro
          </a>
        </div>
        ${
          expirationDate
            ? `<p><em>Este link expira em ${expirationDate.toLocaleDateString()}.</em></p>`
            : ""
        }
        <p>Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.</p>
        <p>Atenciosamente,<br>Equipe BarberFlow</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BarberFlow" <${process.env.EMAIL_FROM || "no-reply@barberflow.com"}>`,
      to: email,
      subject: "Bem-vindo ao BarberFlow - Complete seu cadastro",
      html: htmlContent,
    });
  }

  async sendSubscriptionConfirmation(
    email: string,
    data: SubscriptionConfirmationData,
  ): Promise<void> {
    const { planName, nextBillingDate, amount, receiptUrl } = data;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Assinatura Confirmada!</h1>
        <p>Sua assinatura do plano <strong>${planName}</strong> foi confirmada com sucesso!</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Detalhes da assinatura:</strong></p>
          <p>Plano: ${planName}</p>
          <p>Valor: ${amount}</p>
          ${
            nextBillingDate
              ? `<p>Próxima cobrança: ${nextBillingDate.toLocaleDateString()}</p>`
              : ""
          }
        </div>
        ${
          receiptUrl
            ? `<div style="text-align: center; margin: 30px 0;">
                 <a href="${receiptUrl}" style="background-color: #008CBA; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                   Ver Recibo
                 </a>
               </div>`
            : ""
        }
        <p>Obrigado por escolher o BarberFlow para gerenciar seu negócio!</p>
        <p>Atenciosamente,<br>Equipe BarberFlow</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BarberFlow" <${process.env.EMAIL_FROM || "no-reply@barberflow.com"}>`,
      to: email,
      subject: "Assinatura BarberFlow Confirmada",
      html: htmlContent,
    });
  }

  async sendPaymentFailureAlert(
    email: string,
    data: PaymentFailureData,
  ): Promise<void> {
    const { planName, amount, retryDate, updatePaymentUrl } = data;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d9534f;">Falha no Pagamento</h1>
        <p>Infelizmente, não conseguimos processar o pagamento da sua assinatura do plano <strong>${planName}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Detalhes da assinatura:</strong></p>
          <p>Plano: ${planName}</p>
          <p>Valor: ${amount}</p>
          ${
            retryDate
              ? `<p>Próxima tentativa de cobrança: ${retryDate.toLocaleDateString()}</p>`
              : ""
          }
        </div>
        <p>Para evitar a interrupção do serviço, atualize suas informações de pagamento clicando no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${updatePaymentUrl}" style="background-color: #d9534f; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Atualizar Método de Pagamento
          </a>
        </div>
        <p>Se você precisar de ajuda, entre em contato com nossa equipe de suporte.</p>
        <p>Atenciosamente,<br>Equipe BarberFlow</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"BarberFlow" <${process.env.EMAIL_FROM || "no-reply@barberflow.com"}>`,
      to: email,
      subject: "Ação Necessária: Falha no Pagamento da Assinatura BarberFlow",
      html: htmlContent,
    });
  }
}
