import { DomainEventHandler } from "../common/DomainEventHandler";
import { MemberNicknameChanged } from "../../domain/events/MemberNicknameChanged";
import { discordServerService } from "../services/discordServerService";

export class MemberNicknameChangedHandler implements DomainEventHandler<MemberNicknameChanged> {
  constructor(private readonly guildId: string) {}

  async handle(event: MemberNicknameChanged): Promise<void> {
    const discordId = event.discordId.getValue();
    const newNickname = event.newNickname;
    
    // Discord上でニックネームを設定
    await discordServerService.setMemberNickname(
      this.guildId,
      discordId,
      newNickname
    );
  }
}