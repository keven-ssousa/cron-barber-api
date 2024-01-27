import { container } from "tsyringe";

import { ProductService } from "./product-service";
import { ProductEnum } from "./product-types";

export function getProductsService(): ProductService {
  return container.resolve<ProductService>(ProductEnum.SERVICE);
}
