import cors from "@koa/cors";
import { PrismaClient } from "@prisma/client";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import "reflect-metadata";
import { container } from "tsyringe";
import { AppointmentCreatedHandler } from "./application/notification/event-handlers/appointment-created.handler";
import { AppointmentCreatedEvent } from "./domain/appointment/events/appointment-created.event";
import { SupabaseAuthService } from "./infrastructure/auth/supabase-auth.service";
import { PrismaBarbershopRepository } from "./infrastructure/database/repositories/prisma-barbershop.repository";
import { EventEmitter } from "./infrastructure/events/event-emitter";
import { NodemailerEmailService } from "./infrastructure/notifications/email/nodemailer-email.service";
import { WhatsAppNotificationGateway } from "./infrastructure/notifications/whatsapp/whatsapp-notification.gateway";
import { StripePaymentService } from "./infrastructure/payment/stripe-payment.service";
import { SupabaseService } from "./infrastructure/supabase/supabase.service";
import { createAuthController } from "./presentation/http/controllers/auth.controller";
import { createBarbershopController } from "./presentation/http/controllers/barbershop.controller";
import { createPublicController } from "./presentation/http/controllers/public.controller";
import { createSubscriptionController } from "./presentation/http/controllers/subscription.controller";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Register dependencies
registerDependencies();

// Create and configure Koa app
const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser());

// Register routes
const publicController = createPublicController();
const authController = createAuthController();
const barbershopController = createBarbershopController();
const subscriptionController = createSubscriptionController();

app.use(publicController.routes());
app.use(publicController.allowedMethods());
app.use(authController.routes());
app.use(authController.allowedMethods());
app.use(barbershopController.routes());
app.use(barbershopController.allowedMethods());
app.use(subscriptionController.routes());
app.use(subscriptionController.allowedMethods());

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function registerDependencies() {
  // Core services
  container.registerSingleton("PrismaClient", PrismaClient);
  container.registerSingleton("EventEmitter", EventEmitter);
  container.registerSingleton("SupabaseService", SupabaseService);
  container.registerSingleton("AuthService", SupabaseAuthService);

  // Pagamento e Email
  container.registerSingleton("PaymentService", StripePaymentService);
  container.registerSingleton("EmailService", NodemailerEmailService);

  // Repositories
  container.registerSingleton(
    "BarbershopRepository",
    PrismaBarbershopRepository,
  );

  // Notification gateways
  container.registerSingleton(
    "WhatsAppNotificationGateway",
    WhatsAppNotificationGateway,
  );

  // Event handlers
  const eventEmitter = container.resolve<EventEmitter>("EventEmitter");
  const appointmentCreatedHandler =
    container.resolve<AppointmentCreatedHandler>(AppointmentCreatedHandler);

  // Register event handlers
  eventEmitter.register(AppointmentCreatedEvent, appointmentCreatedHandler);
}
