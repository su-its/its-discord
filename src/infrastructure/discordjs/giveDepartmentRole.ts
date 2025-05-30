import type { Guild, GuildMember } from "discord.js";
import Department from "../../domain/entities/department";
import type Member from "../../domain/entities/member";
import type CustomRole from "../../domain/types/role";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import addRole from "./addRole";

async function giveDepartmentRole(
  guild: Guild,
  guildMember: GuildMember,
  internalMember: Member,
) {
  const departmentRoleMap: Record<string, CustomRole> = {
    [Department.CS]: roleRegistry.getRole(roleRegistryKeys.csRoleKey),
    [Department.IA]: roleRegistry.getRole(roleRegistryKeys.iaRoleKey),
    [Department.BI]: roleRegistry.getRole(roleRegistryKeys.biRoleKey),
    [Department.GRADUATE]: roleRegistry.getRole(
      roleRegistryKeys.graduateRoleKey,
    ),
    [Department.OTHERS]: roleRegistry.getRole(roleRegistryKeys.othersRoleKey),
    [Department.OBOG]: roleRegistry.getRole(roleRegistryKeys.obOgRoleKey),
  };

  const role = departmentRoleMap[internalMember.department];

  await addRole(guild, guildMember, role);
}

export default giveDepartmentRole;
