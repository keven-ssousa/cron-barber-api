import { Jsonable } from "../../../../common/jsonable";

export interface BarberAppointmentDTO {
  barberId: number;
}

export class BarberAppointment implements Jsonable {
  constructor(protected params: BarberAppointmentDTO) {}

  getBarberId(): number {
    return this.params.barberId;
  }

  toJson() {
    return {
      barberId: this.getBarberId(),
    };
  }
}
