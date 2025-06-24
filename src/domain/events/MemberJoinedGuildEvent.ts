import type { DomainEvent } from "../common/DomainEvent";
import type { DiscordId } from "../valueObjects/ids/DiscordId";

export class MemberJoinedGuildEvent implements DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly discordId: DiscordId,
    public readonly guildId: string,
    public readonly displayName: string,
  ) {
    this.occurredOn = new Date();
  }

  getEventName(): string {
    return "MemberJoinedGuild";
  }
}
