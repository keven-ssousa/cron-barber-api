import { Jsonable } from "../../../common/jsonable";

export interface BarberDTO {
  id: number;
  name: string;
  imgUrl?: string;
  avaliableSchedule: number[];
  active: boolean;
}

export class Barber implements Jsonable {
  constructor(protected params: BarberDTO) {}

  getId(): number {
    return this.params.id;
  }

  getName(): string {
    return this.params.name;
  }

  getImgUrl(): string {
    return this.params.imgUrl || "";
  }

  getActive(): boolean {
    return this.params.active;
  }

  getAvaliableSchedule(): number[] {
    return this.params.avaliableSchedule;
  }

  toJson() {
    return {
      id: this.getId(),
      name: this.getName(),
      imgUrl: this.getImgUrl(),
      active: this.getActive(),
      avaliableSchedule: this.getAvaliableSchedule(),
    };
  }
}
