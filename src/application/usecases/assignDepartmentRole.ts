import type Affiliation from "../../domain/entities/affiliation";
import type Member from "../../domain/entities/member";
import type Role from "../../domain/types/role";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import logger from "../../infrastructure/logger";
import type { AppDeps } from "../ports/deps";

const AFFILIATION_ROLE_MAP: Record<Affiliation, string> = {
  情報科学科: roleRegistryKeys.csRoleKey,
  行動情報学科: roleRegistryKeys.biRoleKey,
  情報社会学科: roleRegistryKeys.iaRoleKey,
  工学部: roleRegistryKeys.engineeringRoleKey,
  大学院: roleRegistryKeys.graduateRoleKey,
  その他: roleRegistryKeys.othersRoleKey,
};

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
      const roleKey = AFFILIATION_ROLE_MAP[member.affiliation];
      role = roleRegistry.getRole(roleKey);
      break;
    }
  }

  await deps.discordMemberPort.addRoleToMember(guildId, memberId, role);
  logger.info(
    `Assigned role ${role.name} to member ${member.name} (${memberId})`,
  );
}
