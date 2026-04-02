import type Member from "../../domain/entities/member";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import logger from "../../infrastructure/logger";
import type { AppDeps } from "../ports/deps";
import type { DiscordMember } from "../ports/discordMemberPort";
import { assignMemberRole } from "./assignDepartmentRole";

export interface RoleRefreshResult {
  successCount: number;
  skippedCount: number;
  failureCount: number;
  failedMembers: DiscordMember[];
}

/**
 * ギルド内の全メンバーのロールを ITSCore の最新情報に基づいてリフレッシュする
 * - ITSCore に登録済み＋メール認証済み → 認証済みロール＋所属ロール
 * - ITSCore に登録済み＋メール未認証 → メール未認証ロールのまま
 * - ITSCore 未登録 → スキップ
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
      if (!member) {
        // ITSCore 未登録 → 未認証ロールを付与
        await deps.discordMemberPort.addRoleToMember(
          guildId,
          guildMember.id,
          roleRegistry.getRole(roleRegistryKeys.unauthorizedRoleKey),
        );
        skippedCount++;
        return;
      }

      await refreshMemberRoles(guildId, guildMember.id, member, deps);
      successCount++;
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

async function refreshMemberRoles(
  guildId: string,
  discordUserId: string,
  member: Member,
  deps: Pick<AppDeps, "emailAuthPort" | "discordMemberPort">,
): Promise<void> {
  const isEmailVerified = await deps.emailAuthPort.isEmailVerified(
    member.universityEmail,
  );

  if (!isEmailVerified) {
    await deps.discordMemberPort.addRoleToMember(
      guildId,
      discordUserId,
      roleRegistry.getRole(roleRegistryKeys.unauthorizedRoleKey),
    );
    return;
  }

  await Promise.all([
    assignMemberRole(guildId, discordUserId, member, deps),
    deps.discordMemberPort.addRoleToMember(
      guildId,
      discordUserId,
      roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey),
    ),
    deps.discordMemberPort.removeRoleFromMember(
      guildId,
      discordUserId,
      roleRegistry.getRole(roleRegistryKeys.unauthorizedRoleKey),
    ),
  ]);
}
