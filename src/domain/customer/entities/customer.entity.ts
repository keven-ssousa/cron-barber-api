import { Entity } from "../../../common/types";

export interface CustomerCreateProps {
  id?: number;
  name: string;
  email: string;
  phone: string;
}

export class Customer extends Entity {
  readonly name: string;
  readonly email: string;
  readonly phone: string;

  constructor(props: CustomerCreateProps) {
    super(props.id);
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
    };
  }
}
