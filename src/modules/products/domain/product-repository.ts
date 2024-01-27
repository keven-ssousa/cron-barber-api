import { ProductFilter } from "./product-filter";
import { ProductList } from "./product-list";

export interface ProductRepository {
  getProducts(productRequest: ProductFilter): Promise<ProductList>;
}
