import type { MemberJoinedGuildEvent } from "../../domain/events/MemberJoinedGuildEvent";
import roleRegistry from "../../domain/types/roles";
import { unAuthorizedRoleKey } from "../../domain/types/roles/implementations/unAuthorized";
import type { DomainEventHandler } from "../common/DomainEventHandler";
import { discordServerService } from "../services/discordServerService";

export class MemberJoinedGuildHandler
  implements DomainEventHandler<MemberJoinedGuildEvent>
{
  constructor(private readonly guildId: string) {}

  async handle(event: MemberJoinedGuildEvent): Promise<void> {
    try {
      // ウェルカムDMを送信
      await discordServerService.sendDirectMessage(
        event.discordId.toValue(),
        `ようこそ ${event.displayName} さん！ ITS discord 認証botです!`,
      );
      await discordServerService.sendDirectMessage(
        event.discordId.toValue(),
        "名前(フルネーム)を教えてください",
      );

      // 未承認ロールを付与
      const role = roleRegistry.getRole(unAuthorizedRoleKey);
      await discordServerService.addRoleToMember(
        this.guildId,
        event.discordId.toValue(),
        role,
      );
    } catch (error) {
      // エラーは上位でハンドリングされるためリスロー
      throw new Error(
        `Failed to handle member joined guild event for ${event.discordId.toValue()}: ${error}`,
      );
    }
  }
}
