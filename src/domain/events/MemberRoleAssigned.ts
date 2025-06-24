import { DomainEvent } from "../common/DomainEvent";
import { MemberId } from "../valueObjects/ids/MemberId";
import { DiscordId } from "../valueObjects/ids/DiscordId";

export class MemberRoleAssigned extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly discordId: DiscordId,
    public readonly roleName: string
  ) {
    super();
  }

  getEventName(): string {
    return "MemberRoleAssigned";
  }
}