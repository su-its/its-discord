import logger from "../../infrastructure/logger";
import type { DiscordMember } from "../ports/discordMemberPort";
import { discordServerService } from "../services/discordServerService";
import { itsCoreService } from "../services/itsCoreService";

/**
 * メンバーリネーム結果
 */
export interface MemberRenameResult {
  successCount: number;
  failureCount: number;
  failedMembers: DiscordMember[];
}

/**
 * ギルド内の全メンバーのニックネームを一括変更するUsecase
 * ITSCoreの情報を元に、Discord上のニックネームを実名に設定する
 */
export async function renameAllMembersInGuild(
  guildId: string,
): Promise<MemberRenameResult> {
  // 1. ITSCoreから全メンバーのDiscordIDと名前のマッピングを取得
  const members = await itsCoreService.getMemberList();
  const memberNameMap = new Map<string, string>();

  for (const member of members) {
    if (member.discordId) {
      memberNameMap.set(member.discordId, member.name);
    }
  }

  // 2. Discordから現在のギルドメンバー一覧を取得
  const guildMembers = await discordServerService.getGuildMembers(guildId);

  // 3. 各メンバーのニックネームを個別に変更（単一操作の組み合わせ）
  let successCount = 0;
  let failureCount = 0;
  const failedMembers: DiscordMember[] = [];

  const renamePromises = guildMembers.map(async (member) => {
    try {
      const newName = memberNameMap.get(member.id);
      if (!newName) return; // ITSCoreに登録されていないメンバーはスキップ

      await discordServerService.setMemberNickname(guildId, member.id, newName);
      successCount++;
    } catch (error) {
      failureCount++;
      failedMembers.push(member);
      logger.error(
        `Failed to rename member ${member.displayName} (${member.id}):`,
        error,
      );
    }
  });

  await Promise.all(renamePromises);

  logger.info(
    `Member rename completed: ${successCount} success, ${failureCount} failed`,
  );
  return { successCount, failureCount, failedMembers };
}
