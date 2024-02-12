import { Jsonable } from "../../../common/jsonable";

export interface AppointmentFilterDTO {
  schedule: number;
  customerId: number;
  barberId: number;
}

export class AppointmentFilter implements Jsonable {
  constructor(protected params: AppointmentFilterDTO) {}

  getSchedule(): number {
    return this.params.schedule;
  }

  getBarberId(): number {
    return this.params.barberId;
  }

  getCustomerId(): number {
    return this.params.customerId;
  }

  toJson() {
    return {
      schedule: this.getSchedule(),
      barberId: this.getBarberId(),
      customerId: this.getCustomerId(),
    };
  }
}
