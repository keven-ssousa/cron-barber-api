import { Jsonable } from "../../../common/jsonable";

export interface AppointmentDTO {
  id: number;
  schedule: Date;
  customerId: number;
  barberId: number;
  active: boolean;
}

export class Appointment implements Jsonable {
  constructor(protected params: AppointmentDTO) {}

  getId(): number {
    return this.params.id;
  }

  getSchedule(): Date {
    return this.params.schedule;
  }

  getBarberId(): number {
    return this.params.barberId;
  }

  getCustomerId(): number {
    return this.params.customerId;
  }

  getActive(): boolean {
    return this.params.active;
  }

  toJson() {
    return {
      id: this.getId(),
      schedule: this.getSchedule(),
      barberId: this.getBarberId(),
      customerId: this.getCustomerId(),
      active: this.getActive(),
    };
  }
}
