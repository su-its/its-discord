export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredAt = new Date();
    this.eventId = crypto.randomUUID();
  }

  abstract getEventName(): string;
}
