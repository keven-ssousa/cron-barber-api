import Router from "@koa/router";
import { Context } from "koa";
import { KoaRoutesBuilder } from "../../../../../server/koa/koa-router-builder";
import { getProductsService } from "../../../domain/product-helper";
import { ProductService } from "../../../domain/product-service";
import { ContextProductFilter } from "./adapter/data/context-product-filter";

export class ProductRequestKoaRoutesBuilder extends KoaRoutesBuilder {
  private productService: ProductService = getProductsService();

  build(): Router {
    return this.getProductListBuild().router;
  }

  private getProductListBuild(): ProductRequestKoaRoutesBuilder {
    this.router.get("/product-list", async (ctx: Context) => {
      const productList = await this.productService.getProducts(
        ContextProductFilter.of(ctx)
      );
      const dataList = productList.toJson().products;
      ctx.body = dataList;
    });
    return this;
  }
}
