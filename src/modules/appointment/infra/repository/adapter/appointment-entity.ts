import { Appointments as AppointmentPrisma } from "@prisma/client"; // Importe o modelo do Prisma
import { Appointment as AppointmentDomain } from "../../../domain/appointment";

export class AppointmentAdapter
  implements DomainToPrismaAdapter<AppointmentDomain, AppointmentPrisma>
{
  toPrisma(domainObject: AppointmentDomain): AppointmentPrisma {
    const appointment = domainObject.toJson();

    return appointment as AppointmentPrisma;
  }
}
