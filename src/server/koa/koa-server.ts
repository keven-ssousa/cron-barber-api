import cors from "@koa/cors";
import Router from "@koa/router";
import dotenv from "dotenv";
import { createServer } from "http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { getProductBootstrap } from "../../modules/products/infra/bootstrap/product-bootstrap";
import { ProductRequestKoaRoutesBuilder } from "../../modules/products/infra/http/koa/product-routes-builder";
import { KoaRoutesBuilder } from "./koa-router-builder";

bootstrap();

const app = new Koa();

app.use(cors());
const router = new Router();

buildRoutes();
app.use(bodyParser()).use(router.routes());

createServer(app.callback())
  .listen(process.env.PORT)
  .on("listening", listeningEvent);

function buildRoutes() {
  const routesBuilders: KoaRoutesBuilder[] = [
    new ProductRequestKoaRoutesBuilder(router),
  ];

  for (const routesBuilder of routesBuilders) {
    routesBuilder.build();
  }
}

function bootstrap() {
  dotenv.config();
  getProductBootstrap();
}

function listeningEvent() {
  console.log(`server up and running in http://localhost:${process.env.PORT}`);
}
