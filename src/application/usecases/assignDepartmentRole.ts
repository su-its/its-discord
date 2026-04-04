import type Member from "../../domain/entities/member";
import type Role from "../../domain/types/role";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import { affiliationRoleMap } from "../../domain/types/roles/implementations/categories/departments";
import logger from "../../infrastructure/logger";
import type { AppDeps } from "../ports/deps";

/**
 * メンバーのステータスと所属に応じたロールを付与するUsecase
 */
export async function assignMemberRole(
  guildId: string,
  memberId: string,
  member: Member,
  deps: Pick<AppDeps, "discordMemberPort">,
): Promise<void> {
  let role: Role;

  switch (member.status) {
    case "former":
      role = roleRegistry.getRole(roleRegistryKeys.formerMemberRoleKey);
      break;
    case "unconfirmed":
      role = roleRegistry.getRole(roleRegistryKeys.unconfirmedRoleKey);
      break;
    case "active": {
      const roleKey = affiliationRoleMap[member.affiliation];
      role = roleRegistry.getRole(roleKey);
      break;
    }
  }

  await deps.discordMemberPort.addRoleToMember(guildId, memberId, role);
  logger.info(
    `Assigned role ${role.name} to member ${member.name} (${memberId})`,
  );
}
