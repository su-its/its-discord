import type {
  DomainEventHandler,
  EventDispatcher,
} from "../../application/common/DomainEventHandler";
import type { DomainEvent } from "../../domain/common/DomainEvent";

export class SimpleEventDispatcher implements EventDispatcher {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();

  register<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>,
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const handlers = this.handlers.get(event.getEventName()) || [];

      // 並列実行
      await Promise.all(handlers.map((handler) => handler.handle(event)));
    }
  }
}
