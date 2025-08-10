export interface ScheduleRuleEntity {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  order: number;
  barbershopId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleRuleData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  order: number;
  barbershopId: number;
}

export interface UpdateScheduleRuleData {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
  order?: number;
}
