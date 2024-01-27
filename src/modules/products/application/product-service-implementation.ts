import { inject, injectable } from "tsyringe";
import { ProductFilter } from "../domain/product-filter";
import { ProductList } from "../domain/product-list";
import { ProductRepository } from "../domain/product-repository";
import { ProductService } from "../domain/product-service";
import { ProductEnum } from "../domain/product-types";

@injectable()
export class ProductServiceImplementation implements ProductService {
  constructor(
    @inject(ProductEnum.REPOSITORY)
    private productRepository: ProductRepository
  ) {}

  async getProducts(productRequest: ProductFilter): Promise<ProductList> {
    return await this.productRepository.getProducts(productRequest);
  }
}
