export enum NotificationType {
  APPOINTMENT_CONFIRMATION = "appointment_confirmation",
  APPOINTMENT_REMINDER = "appointment_reminder",
  APPOINTMENT_CANCELED = "appointment_canceled",
  BARBER_NEW_APPOINTMENT = "barber_new_appointment",
}

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationGateway {
  send(
    recipient: string,
    type: NotificationType,
    content: NotificationContent,
  ): Promise<boolean>;
}
