import { ScheduleRule } from "../../../domain/common/value-objects/schedule-rule.vo";

export interface ScheduleRuleDTO {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
  order?: number;
}

export interface ScheduleRuleResponse {
  id: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function mapScheduleRuleToResponse(rule: any): ScheduleRuleResponse {
  const scheduleRule = new ScheduleRule(
    rule.dayOfWeek,
    rule.startTime,
    rule.endTime,
    rule.isActive,
    rule.order,
  );

  return {
    id: rule.id,
    dayOfWeek: rule.dayOfWeek,
    dayName: scheduleRule.getDayName(),
    startTime: rule.startTime,
    endTime: rule.endTime,
    isActive: rule.isActive,
    order: rule.order,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}
