import type Member from "../../domain/entities/member";
import type Role from "../../domain/types/role";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import { affiliationRoleMap } from "../../domain/types/roles/implementations/categories/departments";
import logger from "../../infrastructure/logger";
import type { AppDeps } from "../ports/deps";
import type { DiscordMember } from "../ports/discordMemberPort";

export interface RoleRefreshResult {
  successCount: number;
  skippedCount: number;
  failureCount: number;
  failedMembers: DiscordMember[];
}

/** bot が管理するロールのうちリフレッシュ対象（administrator を除く） */
const MANAGED_ROLE_KEYS = [
  roleRegistryKeys.authorizedRoleKey,
  roleRegistryKeys.unauthorizedRoleKey,
  roleRegistryKeys.unconfirmedRoleKey,
  roleRegistryKeys.formerMemberRoleKey,
  roleRegistryKeys.csRoleKey,
  roleRegistryKeys.biRoleKey,
  roleRegistryKeys.iaRoleKey,
  roleRegistryKeys.engineeringRoleKey,
  roleRegistryKeys.graduateRoleKey,
  roleRegistryKeys.othersRoleKey,
];

const MANAGED_ROLES: readonly Role[] = MANAGED_ROLE_KEYS.map((key) =>
  roleRegistry.getRole(key),
);

/**
 * ギルド内の全メンバーのロールを ITSCore の最新情報に基づいてリフレッシュする
 *
 * 古いロール（所属変更前のロール等）は自動的に外れる
 */
export async function refreshAllMemberRoles(
  guildId: string,
  deps: Pick<AppDeps, "itsCorePort" | "emailAuthPort" | "discordMemberPort">,
): Promise<RoleRefreshResult> {
  const members = await deps.itsCorePort.getMemberList();
  const memberByDiscordId = new Map<string, Member>();

  for (const member of members) {
    if (member.discord) {
      memberByDiscordId.set(member.discord.id, member);
    }
  }

  const guildMembers = await deps.discordMemberPort.getGuildMembers(guildId);

  let successCount = 0;
  let skippedCount = 0;
  let failureCount = 0;
  const failedMembers: DiscordMember[] = [];

  const promises = guildMembers.map(async (guildMember) => {
    const member = memberByDiscordId.get(guildMember.id);

    try {
      const rolesToAdd = await resolveRoles(member, deps);
      await applyRoles(guildId, guildMember.id, rolesToAdd, deps);

      if (member) {
        successCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      failureCount++;
      failedMembers.push(guildMember);
      logger.error(
        `Failed to refresh roles for ${guildMember.displayName} (${guildMember.id}):`,
        error,
      );
    }
  });

  await Promise.all(promises);

  logger.info(
    `Role refresh completed: ${successCount} success, ${skippedCount} skipped, ${failureCount} failed`,
  );
  return { successCount, skippedCount, failureCount, failedMembers };
}

/**
 * メンバーの状態に応じて付与すべきロールの集合を決定する
 */
async function resolveRoles(
  member: Member | undefined,
  deps: Pick<AppDeps, "emailAuthPort">,
): Promise<ReadonlySet<Role>> {
  if (!member) {
    return new Set([
      roleRegistry.getRole(roleRegistryKeys.unauthorizedRoleKey),
    ]);
  }

  const isEmailVerified = await deps.emailAuthPort.isEmailVerified(
    member.universityEmail,
  );
  if (!isEmailVerified) {
    return new Set([
      roleRegistry.getRole(roleRegistryKeys.unauthorizedRoleKey),
    ]);
  }

  const roles = new Set<Role>();
  roles.add(roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey));
  roles.add(getStatusRole(member));
  return roles;
}

function getStatusRole(member: Member): Role {
  switch (member.status) {
    case "former":
      return roleRegistry.getRole(roleRegistryKeys.formerMemberRoleKey);
    case "unconfirmed":
      return roleRegistry.getRole(roleRegistryKeys.unconfirmedRoleKey);
    case "active":
      return roleRegistry.getRole(affiliationRoleMap[member.affiliation]);
  }
}

/**
 * 付与すべきロールを追加し、それ以外の管理対象ロールを外す
 */
async function applyRoles(
  guildId: string,
  discordUserId: string,
  rolesToAdd: ReadonlySet<Role>,
  deps: Pick<AppDeps, "discordMemberPort">,
): Promise<void> {
  const operations: Promise<void>[] = [];

  for (const role of MANAGED_ROLES) {
    if (rolesToAdd.has(role)) {
      operations.push(
        deps.discordMemberPort.addRoleToMember(guildId, discordUserId, role),
      );
    } else {
      operations.push(
        deps.discordMemberPort.removeRoleFromMember(
          guildId,
          discordUserId,
          role,
        ),
      );
    }
  }

  await Promise.all(operations);
}
