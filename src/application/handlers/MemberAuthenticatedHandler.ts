import { DomainEventHandler } from "../common/DomainEventHandler";
import { MemberAuthenticated } from "../../domain/events/MemberAuthenticated";
import { discordServerService } from "../services/discordServerService";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";

export class MemberAuthenticatedHandler implements DomainEventHandler<MemberAuthenticated> {
  constructor(private readonly guildId: string) {}

  async handle(event: MemberAuthenticated): Promise<void> {
    const discordId = event.discordId.getValue();
    
    // 並列で以下の操作を実行
    await Promise.all([
      // 承認済みロールの付与
      discordServerService.addRoleToMember(
        this.guildId,
        discordId,
        roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey),
      ),
      // 未承認ロールの削除
      discordServerService.removeRoleFromMember(
        this.guildId,
        discordId,
        roleRegistry.getRole(roleRegistryKeys.unAuthorizedRoleKey),
      ),
    ]);
  }
}