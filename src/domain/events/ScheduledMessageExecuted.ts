import { DomainEvent } from "../common/DomainEvent";
import { ScheduledMessageId } from "../valueObjects/ids/ScheduledMessageId";
import { ChannelId } from "../valueObjects/ids/ChannelId";

export class ScheduledMessageExecuted extends DomainEvent {
  constructor(
    public readonly messageId: ScheduledMessageId,
    public readonly channelId: ChannelId,
    public readonly executedAt: Date,
    public readonly messageContent: string
  ) {
    super();
  }

  getEventName(): string {
    return "ScheduledMessageExecuted";
  }
}