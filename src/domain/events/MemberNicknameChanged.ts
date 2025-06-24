import { DomainEvent } from "../common/DomainEvent";
import { MemberId } from "../valueObjects/ids/MemberId";
import { DiscordId } from "../valueObjects/ids/DiscordId";

export class MemberNicknameChanged extends DomainEvent {
  constructor(
    public readonly memberId: MemberId,
    public readonly discordId: DiscordId,
    public readonly oldNickname: string | null,
    public readonly newNickname: string
  ) {
    super();
  }

  getEventName(): string {
    return "MemberNicknameChanged";
  }
}