import roleRegistry from "../../domain/types/roles";
import { unAuthorizedRoleKey } from "../../domain/types/roles/implementations/unAuthorized";
import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";

/**
 * 新規メンバーが参加した際の初期化処理を行うUsecase
 * ウェルカムDMの送信と未承認ロールの付与を実行する
 */
export async function handleNewMemberJoined(
  guildId: string,
  memberId: string,
  memberDisplayName: string,
): Promise<void> {
  try {
    // ウェルカムDMを送信
    await discordServerService.sendDirectMessage(
      memberId,
      `ようこそ ${memberDisplayName} さん！ ITS discord 認証botです!`,
    );
    await discordServerService.sendDirectMessage(
      memberId,
      "名前(フルネーム)を教えてください",
    );
    logger.info(`Sent welcome DM to ${memberDisplayName} (${memberId})`);

    // 未承認ロールを付与
    const role = roleRegistry.getRole(unAuthorizedRoleKey);
    await discordServerService.addRoleToMember(guildId, memberId, role);
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
