import { Jsonable } from "../../../common/jsonable";

export interface ProductFilterDTO {
  active: boolean;
}

export class ProductFilter implements Jsonable {
  constructor(protected params: ProductFilterDTO) {}

  getActive(): boolean {
    return this.params.active;
  }

  toJson() {
    return { ...this.params };
  }
}
