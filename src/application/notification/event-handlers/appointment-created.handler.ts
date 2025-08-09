import { inject, injectable } from "tsyringe";
import { AppointmentCreatedEvent } from "../../../domain/appointment/events/appointment-created.event";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";
import {
  NotificationGateway,
  NotificationType,
} from "../../../domain/notification/interfaces/notification-gateway.interface";
import { EventHandler } from "../../../infrastructure/events/event-emitter";

@injectable()
export class AppointmentCreatedHandler
  implements EventHandler<AppointmentCreatedEvent>
{
  constructor(
    @inject("WhatsAppNotificationGateway")
    private readonly notificationGateway: NotificationGateway,

    @inject("AppointmentRepository")
    private readonly appointmentRepository: AppointmentRepository,

    @inject("BarbershopRepository")
    private readonly barbershopRepository: BarbershopRepository,
  ) {}

  async handle(event: AppointmentCreatedEvent): Promise<void> {
    try {
      // 1. Buscar dados detalhados do agendamento
      const appointment = await this.appointmentRepository.findById(
        event.appointmentId,
      );
      if (!appointment) {
        throw new Error(
          `Agendamento com ID ${event.appointmentId} não encontrado`,
        );
      }

      // 2. Buscar dados da barbearia
      const barbershop = await this.barbershopRepository.findById(
        event.barbershopId,
      );
      if (!barbershop) {
        throw new Error(
          `Barbearia com ID ${event.barbershopId} não encontrada`,
        );
      }

      // 3. Buscar dados do serviço
      const service = barbershop.services.find((s) => s.id === event.serviceId);
      if (!service) {
        throw new Error(`Serviço com ID ${event.serviceId} não encontrado`);
      }

      // 4. Buscar dados do cliente (em um cenário real, teríamos um CustomerRepository)
      // Neste exemplo, vamos simular com um objeto fixo
      const customer = {
        id: event.customerId,
        name: "Cliente",
        phoneNumber: "5511999999999", // Número fictício
      };

      // 5. Preparar dados para a notificação
      const formattedDate = this.formatDate(
        appointment.startTime,
        barbershop.timezone,
      );
      const formattedTime = this.formatTime(
        appointment.startTime,
        barbershop.timezone,
      );
      const cancelUrl = `https://barberflow.com/cancel/${event.cancelToken}`;

      // 6. Enviar notificação para o cliente
      await this.notificationGateway.send(
        customer.phoneNumber,
        NotificationType.APPOINTMENT_CONFIRMATION,
        {
          title: `Agendamento Confirmado: ${barbershop.name}`,
          body: `Olá! Seu agendamento para ${service.name} foi confirmado para ${formattedDate} às ${formattedTime}. Para cancelar, acesse: ${cancelUrl}`,
          data: {
            appointmentId: appointment.id,
            barbershopName: barbershop.name,
            serviceName: service.name,
            dateTime: appointment.startTime.toISOString(),
            cancelUrl,
          },
        },
      );

      // 7. Notificar o barbeiro (em um cenário real, buscaríamos o telefone do barbeiro)
      // Neste exemplo, vamos simular com um objeto fixo
      const barber = {
        id: barbershop.ownerId,
        phoneNumber: "5511888888888", // Número fictício
      };

      await this.notificationGateway.send(
        barber.phoneNumber,
        NotificationType.BARBER_NEW_APPOINTMENT,
        {
          title: "Novo Agendamento",
          body: `${customer.name} agendou ${service.name} para ${formattedDate} às ${formattedTime}.`,
          data: {
            appointmentId: appointment.id,
            customerName: customer.name,
            serviceName: service.name,
            dateTime: appointment.startTime.toISOString(),
          },
        },
      );
    } catch (error) {
      console.error("Erro ao processar notificações de agendamento:", error);
    }
  }

  private formatDate(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  private formatTime(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
}
