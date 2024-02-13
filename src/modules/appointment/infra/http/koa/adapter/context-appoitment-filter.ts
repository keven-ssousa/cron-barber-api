import { Context } from "koa";
import { AppointmentFilter } from "../../../../domain/appointment-filter";

export class AppointmentFilterContext extends AppointmentFilter {
  constructor(ctx: Context) {
    const requestBody = ctx.request.body as {
      barberId: number;
      customerId: number;
      schedule: Date;
    };

    super({
      barberId: requestBody.barberId,
      customerId: requestBody.customerId,
      schedule: requestBody.schedule,
    });
  }

  static of(ctx: Context): AppointmentFilter {
    return new AppointmentFilterContext(ctx);
  }
}
