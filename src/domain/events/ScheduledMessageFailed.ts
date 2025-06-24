import { DomainEvent } from "../common/DomainEvent";
import type { ChannelId } from "../valueObjects/ids/ChannelId";
import type { ScheduledMessageId } from "../valueObjects/ids/ScheduledMessageId";

export class ScheduledMessageFailed extends DomainEvent {
  constructor(
    public readonly messageId: ScheduledMessageId,
    public readonly channelId: ChannelId,
    public readonly error: Error,
    public readonly attemptedAt: Date,
  ) {
    super();
  }

  getEventName(): string {
    return "ScheduledMessageFailed";
  }
}
