import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";
import { itsCoreService } from "../services/itsCoreService";
import { getDiscordDisplayName } from "../utils/memberDisplayName";

/**
 * メンバーのニックネーム変更処理の結果
 */
interface NicknameUpdateResult {
  success: boolean;
  message: string;
  reason?: "MEMBER_NOT_FOUND" | "UPDATE_FAILED" | "DISCORD_UPDATE_FAILED";
}

/**
 * メンバーのニックネームを変更するUsecase
 * ITSCoreを先に更新してから、Discordでのニックネーム変更を行う
 */
export async function updateMemberNickname(
  discordUserId: string,
  guildId: string,
  newNickname: string,
): Promise<NicknameUpdateResult> {
  try {
    // 1. ITSCoreでメンバー情報を確認
    const member = await itsCoreService.getMemberByDiscordId(discordUserId);
    if (!member) {
      logger.warn(
        `Member not found in ITSCore for Discord ID: ${discordUserId}`,
      );
      return {
        success: false,
        message:
          "メンバー情報がITSCoreに存在しません。管理者に連絡してください。",
        reason: "MEMBER_NOT_FOUND",
      };
    }

    // 2. ITSCoreでニックネームを更新
    try {
      await itsCoreService.updateMemberNickname({
        discordAccountId: discordUserId,
        discordNickName: newNickname,
      });
      logger.info(
        `ITSCore nickname updated for ${member.name} (${discordUserId}): ${newNickname}`,
      );
    } catch (error) {
      logger.error(`Failed to update nickname in ITSCore: ${error}`);
      return {
        success: false,
        message: "ITSCoreでニックネームの更新に失敗しました。",
        reason: "UPDATE_FAILED",
      };
    }

    // 3. Discordでニックネームを更新（「本名 / ニックネーム」形式）
    try {
      const discordDisplayName = getDiscordDisplayName(
        member.name,
        newNickname,
      );
      await discordServerService.setMemberNickname(
        guildId,
        discordUserId,
        discordDisplayName,
      );
      logger.info(
        `Discord nickname updated for ${member.name} (${discordUserId}): ${discordDisplayName}`,
      );
    } catch (error) {
      logger.error(`Failed to update nickname in Discord: ${error}`);
      return {
        success: false,
        message: "Discordでニックネームの更新に失敗しました。",
        reason: "DISCORD_UPDATE_FAILED",
      };
    }

    return {
      success: true,
      message: `ニックネームを「${newNickname}」に変更しました。Discordでは「${getDiscordDisplayName(member.name, newNickname)}」と表示されます。`,
    };
  } catch (error) {
    logger.error("Error updating member nickname:", error);
    return {
      success: false,
      message: "ニックネームの変更中にエラーが発生しました。",
      reason: "UPDATE_FAILED",
    };
  }
}
