import Department from "../../domain/entities/department";
import type InternalMember from "../../domain/entities/member";
import type Role from "../../domain/types/role";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";

/**
 * メンバーの部署に応じたロールを付与するUsecase
 * ビジネスルール（部署→ロールマッピング）をApplication層で管理
 */
export async function assignDepartmentRole(
  guildId: string,
  memberId: string,
  member: InternalMember,
): Promise<void> {
  // 部署に対応するロールマッピング（ビジネスルール）
  const departmentRoleMap: Record<string, Role> = {
    [Department.CS]: roleRegistry.getRole(roleRegistryKeys.csRoleKey),
    [Department.IA]: roleRegistry.getRole(roleRegistryKeys.iaRoleKey),
    [Department.BI]: roleRegistry.getRole(roleRegistryKeys.biRoleKey),
    [Department.GRADUATE]: roleRegistry.getRole(
      roleRegistryKeys.graduateRoleKey,
    ),
    [Department.OTHERS]: roleRegistry.getRole(roleRegistryKeys.othersRoleKey),
    [Department.OBOG]: roleRegistry.getRole(roleRegistryKeys.obOgRoleKey),
  };

  const role = departmentRoleMap[member.department];
  if (role) {
    await discordServerService.addRoleToMember(guildId, memberId, role);
    logger.info(
      `Assigned department role ${role.name} to member ${member.name} (${memberId})`,
    );
  } else {
    logger.warn(
      `No role mapping found for department: ${member.department} (member: ${member.name})`,
    );
  }
}
