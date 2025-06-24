import { DomainEvent } from "../common/DomainEvent";
import type { ChannelId } from "../valueObjects/ids/ChannelId";
import type { ScheduledMessageId } from "../valueObjects/ids/ScheduledMessageId";

export class ScheduledMessageExecuted extends DomainEvent {
  constructor(
    public readonly messageId: ScheduledMessageId,
    public readonly channelId: ChannelId,
    public readonly executedAt: Date,
    public readonly messageContent: string,
  ) {
    super();
  }

  getEventName(): string {
    return "ScheduledMessageExecuted";
  }
}
