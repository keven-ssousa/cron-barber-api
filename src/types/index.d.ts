import "koa";

declare module "koa" {
  interface Context {
    request: {
      body: any;
    };
  }
}
