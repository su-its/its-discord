import { DomainEvent } from "../../domain/common/DomainEvent";

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface EventDispatcher {
  dispatch(events: DomainEvent[]): Promise<void>;
  register<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>
  ): void;
}