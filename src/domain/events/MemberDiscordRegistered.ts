import { DomainEvent } from "../common/DomainEvent";
import type { DiscordId } from "../valueObjects/ids/DiscordId";
import type { MemberId } from "../valueObjects/ids/MemberId";

export class MemberDiscordRegistered extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly discordId: DiscordId,
  ) {
    super();
  }

  getEventName(): string {
    return "MemberDiscordRegistered";
  }
}
