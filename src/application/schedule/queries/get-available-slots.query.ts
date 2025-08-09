import { inject, injectable } from "tsyringe";
import { Appointment } from "../../../domain/appointment/entities/appointment.entity";
import { AppointmentRepository } from "../../../domain/appointment/repositories/appointment.repository";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";
import { ScheduleRule } from "../../../domain/common/value-objects/schedule-rule.vo";
import { TimeSlot } from "../../../domain/common/value-objects/time-slot.vo";

export interface GetAvailableSlotsQuery {
  slug: string;
  date: string;
  serviceId: number;
}

export interface GetAvailableSlotsResult {
  slots: {
    startTime: string;
    endTime: string;
    formattedTime: string;
  }[];
}

@injectable()
export class GetAvailableSlotsHandler {
  constructor(
    @inject("BarbershopRepository")
    private readonly barbershopRepository: BarbershopRepository,

    @inject("AppointmentRepository")
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    query: GetAvailableSlotsQuery,
  ): Promise<GetAvailableSlotsResult> {
    const { slug, date, serviceId } = query;

    // 1. Buscar a barbearia pelo slug
    const barbershop = await this.barbershopRepository.findBySlug(slug);
    if (!barbershop) {
      throw new Error(`Barbearia com slug ${slug} não encontrada`);
    }

    // 2. Buscar o serviço solicitado
    const service = barbershop.services.find((s) => s.id === serviceId);
    if (!service || !service.isActive) {
      throw new Error(`Serviço não encontrado ou inativo`);
    }

    // 3. Verificar o dia da semana
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getUTCDay(); // 0-6 (Domingo-Sábado)

    // 4. Buscar regras de disponibilidade para o dia da semana
    const scheduleRule = barbershop.scheduleRules.find(
      (rule) => rule.dayOfWeek === dayOfWeek && rule.isActive,
    );

    if (!scheduleRule) {
      return { slots: [] }; // Barbearia fechada neste dia
    }

    // 5. Gerar slots candidatos com base nas regras
    const availableSlots = this.generateTimeSlots(
      requestDate,
      scheduleRule,
      service.durationMinutes,
      barbershop.timezone,
    );

    // 6. Buscar agendamentos existentes para a data
    const existingAppointments =
      await this.appointmentRepository.findByDateRange(
        barbershop.id as number,
        this.getStartOfDay(requestDate),
        this.getEndOfDay(requestDate),
      );

    // 7. Filtrar slots que conflitam com agendamentos
    const availableSlotsFiltered = this.filterConflictingSlots(
      availableSlots,
      existingAppointments,
      service.durationMinutes,
    );

    // 8. Formatar os slots para retorno
    return {
      slots: availableSlotsFiltered.map((slot) => ({
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        formattedTime: this.formatTimeRange(slot, barbershop.timezone),
      })),
    };
  }

  private generateTimeSlots(
    date: Date,
    scheduleRule: ScheduleRule,
    durationMinutes: number,
    timezone: string,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = scheduleRule.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = scheduleRule.endTime.split(":").map(Number);

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    let currentTime = new Date(
      Date.UTC(year, month, day, startHour, startMinute),
    );
    const endTime = new Date(Date.UTC(year, month, day, endHour, endMinute));

    // Gera slots até que o próximo slot ultrapasse o horário de término
    while (true) {
      const slotEndTime = new Date(
        currentTime.getTime() + durationMinutes * 60000,
      );

      if (slotEndTime > endTime) {
        break;
      }

      slots.push(new TimeSlot(new Date(currentTime), slotEndTime));

      // Avança para o próximo slot (em intervalos de 15 minutos)
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }

    return slots;
  }

  private filterConflictingSlots(
    slots: TimeSlot[],
    appointments: Appointment[],
    durationMinutes: number,
  ): TimeSlot[] {
    // Filtra slots que não conflitam com agendamentos existentes
    return slots.filter((slot) => {
      // Verifica se o slot atual conflita com algum agendamento
      const hasConflict = appointments.some((appointment) => {
        return slot.overlaps(appointment.timeSlot);
      });

      return !hasConflict;
    });
  }

  private getStartOfDay(date: Date): Date {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(Date.UTC(year, month, day, 0, 0, 0));
  }

  private getEndOfDay(date: Date): Date {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  }

  private formatTimeRange(slot: TimeSlot, timezone: string): string {
    const formattedTime = slot.format(timezone);
    return `${formattedTime.start} - ${formattedTime.end}`;
  }
}
