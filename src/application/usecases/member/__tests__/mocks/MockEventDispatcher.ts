import type { DomainEvent } from "../../../../../domain/common/DomainEvent";
import type {
  DomainEventHandler,
  EventDispatcher,
} from "../../../../common/DomainEventHandler";

export class MockEventDispatcher implements EventDispatcher {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();
  public dispatchedEvents: DomainEvent[] = [];
  public dispatchCallCount = 0;

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
    this.dispatchCallCount++;
    this.dispatchedEvents.push(...events);

    // 実際のハンドラー実行はテストでは省略
    // テストでは dispatchedEvents を確認するだけ
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.dispatchedEvents = [];
    this.dispatchCallCount = 0;
  }

  getEventsByType(eventType: string): DomainEvent[] {
    return this.dispatchedEvents.filter(
      (event) => event.getEventName() === eventType,
    );
  }
}
