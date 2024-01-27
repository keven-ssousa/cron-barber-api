import { ProductFilter } from "./product-filter";
import { ProductList } from "./product-list";

export interface ProductService {
  getProducts(productRequest: ProductFilter): Promise<ProductList>;
}
