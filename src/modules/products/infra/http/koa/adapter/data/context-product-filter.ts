import { Context } from "koa";
import { ProductFilter } from "../../../../../domain/product-filter";

export class ContextProductFilter extends ProductFilter {
  constructor(ctx: Context) {
    const active = ctx.request.body.active;
    super({
      active,
    });
  }
  static of(ctx: Context): ProductFilter {
    return new ContextProductFilter(ctx);
  }
}
