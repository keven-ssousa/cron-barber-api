import cors from "@koa/cors";
import Router from "@koa/router";
import dotenv from "dotenv";
import { createServer } from "http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { getAppointmentBootstrap } from "../../modules/appointment/infra/bootstrap/appoitment-boostrap";
import { AppointmentRequestKoaRoutesBuilder } from "../../modules/appointment/infra/http/koa/appoitment-koa-router-builder";
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
    new AppointmentRequestKoaRoutesBuilder(router),
  ];

  for (const routesBuilder of routesBuilders) {
    routesBuilder.build();
  }
}

function bootstrap() {
  dotenv.config();
  getAppointmentBootstrap();
}

function listeningEvent() {
  console.log(`server up and running in http://localhost:${process.env.PORT}`);
}
