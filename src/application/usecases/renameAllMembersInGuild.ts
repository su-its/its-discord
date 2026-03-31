import logger from "../../infrastructure/logger";
import type { DiscordMember } from "../ports/discordMemberPort";
import { discordServerService } from "../services/discordServerService";
import { itsCoreService } from "../services/itsCoreService";
import { getDiscordDisplayName } from "../utils/memberDisplayName";

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
 * ITSCoreの情報を元に、Discord上のニックネームを設定する
 * ニックネームが設定されている場合は「本名 / ニックネーム」、設定されていない場合は「本名」を使用する
 */
export async function renameAllMembersInGuild(
  guildId: string,
): Promise<MemberRenameResult> {
  // 1. ITSCoreから全メンバーのDiscordIDと表示名のマッピングを取得
  const members = await itsCoreService.getMemberList();
  const memberNameMap = new Map<string, string>();

  for (const member of members) {
    if (member.discordId) {
      // Discord表示名ルールに従って表示名を決定
      const displayName = getDiscordDisplayName(
        member.name,
        member.discordNickname,
      );
      memberNameMap.set(member.discordId, displayName);
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
