import { DomainEvent } from "../common/DomainEvent";
import { MemberId } from "../valueObjects/ids/MemberId";
import { DiscordId } from "../valueObjects/ids/DiscordId";

export class MemberAuthenticated extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly discordId: DiscordId
  ) {
    super();
  }

  getEventName(): string {
    return "MemberAuthenticated";
  }
}