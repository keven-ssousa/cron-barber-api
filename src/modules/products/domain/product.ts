import { Jsonable } from "../../../common/jsonable";
import { ID } from "../../../common/types";

export interface ProductDTO {
  id: ID;
  name: string;
  description: string;
  price: number;
  imgUrl?: string;
  active: boolean;
}

export class Product implements Jsonable {
  constructor(protected params: ProductDTO) {}

  getId(): ID {
    return this.params.id;
  }

  getName(): string {
    return this.params.name;
  }

  getDescription(): string {
    return this.params.description;
  }

  getActive(): boolean {
    return this.params.active;
  }

  getPrice(): number {
    return this.params.price;
  }

  getImgUrl(): string {
    return this.params.imgUrl || "";
  }

  toJson() {
    return {
      id: this.getId(),
      name: this.getName(),
      description: this.getDescription(),
      active: this.getActive(),
      price: this.getPrice(),
      imgUrl: this.getImgUrl(),
    };
  }
}
