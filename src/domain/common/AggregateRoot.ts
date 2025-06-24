import type { DomainEvent } from "./DomainEvent";
import { Entity } from "./Entity";
import type { Identifier } from "./Identifier";

export abstract class AggregateRoot<
  T extends Identifier<any>,
> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public markEventsForDispatch(): void {
    // イベントを発行準備完了としてマーク
    // 実装ではEventDispatcherに送信
  }
}
