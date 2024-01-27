import { Jsonable } from "../../../common/jsonable";
import { Product } from "./product";

export interface ProductListDTO {
  products: Product[];
}

export class ProductList implements Jsonable {
  constructor(protected paramns: ProductListDTO) {}

  getProducts(): Product[] {
    return this.paramns.products;
  }

  toJson() {
    return {
      products: this.getProducts().map((productData) => productData.toJson()),
    };
  }
}
