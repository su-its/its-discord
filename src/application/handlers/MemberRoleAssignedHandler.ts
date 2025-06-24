import type { MemberRoleAssigned } from "../../domain/events/MemberRoleAssigned";
import roleRegistry from "../../domain/types/roles";
import type { DomainEventHandler } from "../common/DomainEventHandler";
import { discordServerService } from "../services/discordServerService";

export class MemberRoleAssignedHandler
  implements DomainEventHandler<MemberRoleAssigned>
{
  constructor(private readonly guildId: string) {}

  async handle(event: MemberRoleAssigned): Promise<void> {
    const discordId = event.discordId.getValue();
    const roleName = event.roleName;

    // Discord上でロールを付与
    const role = roleRegistry.getRole(roleName);
    await discordServerService.addRoleToMember(this.guildId, discordId, role);
  }
}
