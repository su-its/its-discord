import { DomainEvent } from "../common/DomainEvent";
import { ScheduledMessageId } from "../valueObjects/ids/ScheduledMessageId";
import { ChannelId } from "../valueObjects/ids/ChannelId";

export class ScheduledMessageFailed extends DomainEvent {
  constructor(
    public readonly messageId: ScheduledMessageId,
    public readonly channelId: ChannelId,
    public readonly error: Error,
    public readonly attemptedAt: Date
  ) {
    super();
  }

  getEventName(): string {
    return "ScheduledMessageFailed";
  }
}