import { DomainEvent } from "../common/DomainEvent";
import type { DiscordId } from "../valueObjects/ids/DiscordId";
import type { MemberId } from "../valueObjects/ids/MemberId";

export class MemberRoleAssigned extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly discordId: DiscordId,
    public readonly roleName: string,
  ) {
    super();
  }

  getEventName(): string {
    return "MemberRoleAssigned";
  }
}
