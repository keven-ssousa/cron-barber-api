import Router from "@koa/router";
import { Context } from "koa";
import { KoaRoutesBuilder } from "../../../../../server/koa/koa-router-builder";
import { getAppointmentService } from "../../../domain/appointment-helper";
import { AppointmentService } from "../../../domain/appointment-service";
import { AppointmentFilterContext } from "./adapter/context-appoitment-filter";

export class AppointmentRequestKoaRoutesBuilder extends KoaRoutesBuilder {
  private appointmentService: AppointmentService = getAppointmentService();

  build(): Router {
    return this.postAppointmenetBuild().router;
  }

  private postAppointmenetBuild(): AppointmentRequestKoaRoutesBuilder {
    this.router.post("/appointment/create", async (ctx: Context) => {
      const appointment = await this.appointmentService.createAppointment(
        AppointmentFilterContext.of(ctx),
      );
      ctx.body = appointment.toJson();
    });
    return this;
  }
}
