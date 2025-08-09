import { injectable } from "tsyringe";

export interface EventHandler<T> {
  handle(event: T): Promise<void>;
}

@injectable()
export class EventEmitter {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  register<T>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>,
  ): void {
    const eventName = eventType.name;
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }

  emit<T extends object>(event: T): void {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];

    for (const handler of handlers) {
      // Execute handlers asynchronously
      Promise.resolve()
        .then(() => handler.handle(event))
        .catch((error) => {
          console.error(`Error handling event ${eventName}:`, error);
        });
    }
  }
}
