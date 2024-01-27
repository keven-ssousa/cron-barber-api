import Router from "@koa/router";

export abstract class KoaRoutesBuilder {
  constructor(protected router: Router) {}

  abstract build(): Router;
}
