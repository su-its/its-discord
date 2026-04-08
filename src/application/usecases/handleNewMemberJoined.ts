import type { AppDeps } from "@application/ports";
import roleRegistry, { roleRegistryKeys } from "@domain/types/roles";
import logger from "@infrastructure/logger";

/**
 * 新規メンバーが参加した際の初期化処理を行うUsecase
 * ウェルカムDMの送信と未承認ロールの付与を実行する
 */
export async function handleNewMemberJoined(
  guildId: string,
  memberId: string,
  memberDisplayName: string,
  deps: Pick<AppDeps, "discordMemberPort" | "discordMessagePort">,
): Promise<void> {
  try {
    // ウェルカムDMを送信
    await deps.discordMessagePort.sendDirectMessage(
      memberId,
      `ようこそ ${memberDisplayName} さん！\nサーバーで \`/auth\` コマンドを実行して認証を行ってください。`,
    );
    logger.info(`Sent welcome DM to ${memberDisplayName} (${memberId})`);

    // 未承認ロールを付与
    const role = roleRegistry.getRole(roleRegistryKeys.unauthorizedRoleKey);
    await deps.discordMemberPort.addRoleToMember(guildId, memberId, role);
    logger.info(
      `Assigned Unauthorized role (${role.name}) to ${memberDisplayName} (${memberId})`,
    );
  } catch (error) {
    logger.error(
      `Failed to handle new member ${memberDisplayName} (${memberId}):`,
      error,
    );
    throw error;
  }
}
