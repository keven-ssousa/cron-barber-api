import {
  CreateScheduleRuleData,
  ScheduleRuleEntity,
  UpdateScheduleRuleData,
} from "../entities/schedule-rule.entity";

export interface ScheduleRuleRepository {
  findById(id: number): Promise<ScheduleRuleEntity | null>;
  findByBarbershopId(barbershopId: number): Promise<ScheduleRuleEntity[]>;
  create(data: CreateScheduleRuleData): Promise<ScheduleRuleEntity>;
  update(id: number, data: UpdateScheduleRuleData): Promise<ScheduleRuleEntity>;
  delete(id: number): Promise<boolean>;
  findByBarbershopAndDay(
    barbershopId: number,
    dayOfWeek: number,
  ): Promise<ScheduleRuleEntity[]>;
}
