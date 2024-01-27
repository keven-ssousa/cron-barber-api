import { container } from "tsyringe";
import { ProductServiceImplementation } from "../../application/product-service-implementation";
import { ProductEnum } from "../../domain/product-types";
import { ProductRepositoryStripe } from "../stripe/product-repostitoy-stripe";

export function getProductBootstrap() {
  container.register(ProductEnum.REPOSITORY, ProductRepositoryStripe);
  container.register(ProductEnum.SERVICE, ProductServiceImplementation);
}
