export class AppointmentCreatedEvent {
  constructor(
    public readonly appointmentId: number,
    public readonly barbershopId: number,
    public readonly customerId: number,
    public readonly startTime: Date,
    public readonly serviceId: number,
    public readonly cancelToken: string,
  ) {}
}
