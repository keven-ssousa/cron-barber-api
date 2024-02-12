import { Jsonable } from "../../../common/jsonable";

export interface CustomerDTO {
  id: number;
  name: string;
  phoneNumber: number;
  email: string;
  active: boolean;
}

export class Customer implements Jsonable {
  constructor(protected params: CustomerDTO) {}

  getId(): number {
    return this.params.id;
  }

  getName(): string {
    return this.params.name;
  }

  getEmail(): string {
    return this.params.email;
  }

  getPhoneNumber(): number {
    return this.params.phoneNumber;
  }

  getActive(): boolean {
    return this.params.active;
  }

  toJson() {
    return {
      id: this.getId(),
      name: this.getName(),
      phoneNumber: this.getPhoneNumber(),
      email: this.getEmail(),
      active: this.getActive(),
    };
  }
}
