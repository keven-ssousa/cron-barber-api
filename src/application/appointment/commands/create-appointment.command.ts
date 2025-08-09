import { inject, injectable } from "tsyringe";
import { Appointment } from "../../../domain/appointment/entities/appointment.entity";
import { AppointmentCreatedEvent } from "../../../domain/appointment/events/appointment-created.event";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";
import { EventEmitter } from "../../../infrastructure/events/event-emitter";

export interface CreateAppointmentCommand {
  barbershopId: number;
  serviceId: number;
  customerId: number;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  notes?: string;
}

export interface CreateAppointmentResult {
  id: number;
  startTime: string;
  endTime: string;
  cancelToken: string;
}

@injectable()
export class CreateAppointmentHandler {
  constructor(
    @inject("AppointmentRepository")
    private readonly appointmentRepository: AppointmentRepository,

    @inject("BarbershopRepository")
    private readonly barbershopRepository: BarbershopRepository,

    @inject("EventEmitter")
    private readonly eventEmitter: EventEmitter,
  ) {}

  async execute(
    command: CreateAppointmentCommand,
  ): Promise<CreateAppointmentResult> {
    const { barbershopId, serviceId, customerId, startTime, endTime, notes } =
      command;

    // 1. Verificar se a barbearia existe
    const barbershop = await this.barbershopRepository.findById(barbershopId);
    if (!barbershop) {
      throw new Error(`Barbearia com ID ${barbershopId} não encontrada`);
    }

    // 2. Verificar se o serviço existe e pertence à barbearia
    const service = barbershop.services.find((s) => s.id === serviceId);
    if (!service || !service.isActive) {
      throw new Error(`Serviço com ID ${serviceId} não encontrado ou inativo`);
    }

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    // 3. Verificar se há conflitos de horário
    const hasConflict = await this.appointmentRepository.checkForConflicts(
      barbershopId,
      startTimeDate,
      endTimeDate,
    );

    if (hasConflict) {
      throw new Error("Horário solicitado não está mais disponível");
    }

    // 4. Criar o agendamento
    const appointment = new Appointment({
      barbershopId,
      serviceId,
      customerId,
      startTime: startTimeDate,
      endTime: endTimeDate,
      notes,
    });

    // 5. Persistir o agendamento
    const createdAppointment =
      await this.appointmentRepository.create(appointment);

    // 6. Emitir evento de agendamento criado
    this.eventEmitter.emit(
      new AppointmentCreatedEvent(
        createdAppointment.id as number,
        barbershopId,
        customerId,
        startTimeDate,
        serviceId,
        createdAppointment.cancelToken,
      ),
    );

    // 7. Retornar resultado
    return {
      id: createdAppointment.id as number,
      startTime: createdAppointment.startTime.toISOString(),
      endTime: createdAppointment.endTime.toISOString(),
      cancelToken: createdAppointment.cancelToken,
    };
  }
}
