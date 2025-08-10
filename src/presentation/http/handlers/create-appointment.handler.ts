import { Context } from "koa";
import { container } from "tsyringe";
import { CreateAppointmentHandler } from "../../../application/appointment/commands/create-appointment.command";
import { GetBarbershopHandler } from "../../../application/barbershop/queries/get-barbershop.query";
import { FindOrCreateCustomerHandler } from "../../../application/customer/commands/find-or-create-customer.command";
import { GetAvailableSlotsHandler } from "../../../application/schedule/queries/get-available-slots.query";

function parseCustomerInfo(notes: string) {
  // Extract customer info from notes string
  const nameMatch = notes.match(/Name:\s*(.*)/);
  const emailMatch = notes.match(/Email:\s*(.*)/);
  const phoneMatch = notes.match(/Phone:\s*(.*)/);

  if (!nameMatch || !emailMatch || !phoneMatch) {
    return null;
  }

  return {
    name: nameMatch[1].trim(),
    email: emailMatch[1].trim(),
    phone: phoneMatch[1].trim().replace(/[^+\d]/g, ""), // Remove non-numeric chars except +
  };
}

interface CreateAppointmentBody {
  serviceId: number;
  startTime: string;
  endTime: string;
  notes: string;
  customerId?: number; // Optional, legacy support
}

export async function handleCreateAppointment(ctx: Context) {
  const { slug } = ctx.params;
  const { serviceId, startTime, endTime, notes } = ctx.request
    .body as CreateAppointmentBody;

  // Validate required fields
  if (!serviceId || !startTime || !endTime || !notes) {
    ctx.status = 400;
    ctx.body = { error: "Missing required fields" };
    return;
  }

  // Extract customer info from notes
  const customer = parseCustomerInfo(notes);
  if (!customer) {
    ctx.status = 400;
    ctx.body = { error: "Invalid customer information format" };
    return;
  }

  try {
    // Get barbershop details
    const getBarbershopHandler = container.resolve(GetBarbershopHandler);
    const barbershop = await getBarbershopHandler.execute({ slug });

    // Check if service exists
    const service = barbershop.services.find(
      (s: any) => s.id === Number(serviceId),
    );
    if (!service) {
      ctx.status = 400;
      ctx.body = { error: "Serviço não encontrado" };
      return;
    }

    // Validate availability
    const availabilityHandler = container.resolve(GetAvailableSlotsHandler);
    const availableSlots = await availabilityHandler.execute({
      slug,
      date: startTime.split("T")[0],
      serviceId: Number(serviceId),
    });

    const isSlotAvailable = availableSlots.slots.some(
      (slot) => slot.startTime === startTime && slot.endTime === endTime,
    );

    if (!isSlotAvailable) {
      ctx.status = 400;
      ctx.body = { error: "Horário não está disponível" };
      return;
    }

    // Find or create customer
    const findOrCreateCustomerHandler = container.resolve(
      FindOrCreateCustomerHandler,
    );
    const customerResult = await findOrCreateCustomerHandler.execute({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });

    // Create appointment
    const handler = container.resolve(CreateAppointmentHandler);
    const result = await handler.execute({
      barbershopId: barbershop.id as number,
      serviceId: Number(serviceId),
      customerId: customerResult.id as number,
      startTime,
      endTime,
      notes,
    });

    ctx.status = 201;
    ctx.body = result;
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
}
