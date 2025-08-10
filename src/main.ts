import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import "reflect-metadata";
import { container } from "tsyringe";
import { CreateAccountFromInviteHandler } from "./application/auth/commands/create-account-from-invite.command";
import { AppointmentCreatedHandler } from "./application/notification/event-handlers/appointment-created.handler";
import { AppointmentCreatedEvent } from "./domain/appointment/events/appointment-created.event";
import { SupabaseAuthService } from "./infrastructure/auth/supabase-auth.service";
import { PrismaAppointmentRepository } from "./infrastructure/database/repositories/prisma-appointment.repository";
import { PrismaBarbershopRepository } from "./infrastructure/database/repositories/prisma-barbershop.repository";
import { PrismaCustomerRepository } from "./infrastructure/database/repositories/prisma-customer.repository";
import { PrismaScheduleRuleRepository } from "./infrastructure/database/repositories/prisma-schedule-rule.repository";
import { PrismaServiceRepository } from "./infrastructure/database/repositories/prisma-service.repository";
import { PrismaUserRepository } from "./infrastructure/database/repositories/prisma-user.repository";
import { PrismaSubscriptionInviteService } from "./infrastructure/database/services/prisma-subscription-invite.service";
import { PrismaService } from "./infrastructure/database/services/prisma.service";
import { EventEmitter } from "./infrastructure/events/event-emitter";
import { NodemailerEmailService } from "./infrastructure/notifications/email/nodemailer-email.service";
import { WhatsAppNotificationGateway } from "./infrastructure/notifications/whatsapp/whatsapp-notification.gateway";
import { StripePaymentService } from "./infrastructure/payment/stripe-payment.service";
import { SupabaseService } from "./infrastructure/supabase/supabase.service";
import { createAuthController } from "./presentation/http/controllers/auth.controller";
import { createBarbershopController } from "./presentation/http/controllers/barbershop.controller";
import { createPrivateAppointmentController } from "./presentation/http/controllers/private-appointment.controller";
import { createPublicController } from "./presentation/http/controllers/public.controller";
import { createScheduleRuleController } from "./presentation/http/controllers/schedule-rule.controller";
import { createServiceController } from "./presentation/http/controllers/service.controller";
import { createSubscriptionController } from "./presentation/http/controllers/subscription.controller";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Register dependencies
registerDependencies();

// Create and configure Koa app
const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(bodyParser());

// Register routes
const publicController = createPublicController();
const authController = createAuthController();
const barbershopController = createBarbershopController();
const serviceController = createServiceController();
const scheduleRuleController = createScheduleRuleController();
const subscriptionController = createSubscriptionController();
const privateAppointmentController = createPrivateAppointmentController();

app.use(publicController.routes());
app.use(publicController.allowedMethods());
app.use(authController.routes());
app.use(authController.allowedMethods());
app.use(barbershopController.routes());
app.use(barbershopController.allowedMethods());
app.use(serviceController.routes());
app.use(serviceController.allowedMethods());
app.use(scheduleRuleController.routes());
app.use(scheduleRuleController.allowedMethods());
app.use(subscriptionController.routes());
app.use(subscriptionController.allowedMethods());
app.use(privateAppointmentController.routes());
app.use(privateAppointmentController.allowedMethods());

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function registerDependencies() {
  // Core services
  container.registerSingleton<PrismaService>("PrismaService", PrismaService);
  container.registerSingleton("EventEmitter", EventEmitter);
  container.registerSingleton("SupabaseService", SupabaseService);
  container.registerSingleton("AuthService", SupabaseAuthService);

  // Customer
  container.registerSingleton("CustomerRepository", PrismaCustomerRepository);

  // Pagamento e Email
  container.registerSingleton("PaymentService", StripePaymentService);
  container.registerSingleton("EmailService", NodemailerEmailService);

  // Serviços de assinatura
  container.registerSingleton(
    "SubscriptionInviteService",
    PrismaSubscriptionInviteService,
  );

  // Command handlers
  container.registerSingleton(
    "CreateAccountFromInviteHandler",
    CreateAccountFromInviteHandler,
  );

  // Repositories
  container.registerSingleton(
    "BarbershopRepository",
    PrismaBarbershopRepository,
  );

  container.registerSingleton("PrismaUserRepository", PrismaUserRepository);
  container.registerSingleton("ServiceRepository", PrismaServiceRepository);
  container.registerSingleton(
    "ScheduleRuleRepository",
    PrismaScheduleRuleRepository,
  );

  // Repositórios de módulos
  container.registerSingleton(
    "AppointmentRepository",
    PrismaAppointmentRepository,
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
