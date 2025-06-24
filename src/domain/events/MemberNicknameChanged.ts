import { DomainEvent } from "../common/DomainEvent";
import type { DiscordId } from "../valueObjects/ids/DiscordId";
import type { MemberId } from "../valueObjects/ids/MemberId";

export class MemberNicknameChanged extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly discordId: DiscordId,
    public readonly oldNickname: string | null,
    public readonly newNickname: string,
  ) {
    super();
  }

  getEventName(): string {
    return "MemberNicknameChanged";
  }
}
