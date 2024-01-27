import { camelize } from "@ridi/object-case-converter";
import { Product } from "../../../domain/product";
import { ProductList } from "../../../domain/product-list";

export class ResponseToProduct extends ProductList {
  constructor(response: any) {
    const products: any = camelize(response.data, { recursive: true });

    super({
      products: products.map((products: any) => new Product({ ...products })),
    });
  }

  static of(response: any): ResponseToProduct {
    return new ResponseToProduct(response);
  }
}
