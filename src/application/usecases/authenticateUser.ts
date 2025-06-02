import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";
import { emailAuthService } from "../services/emailAuthService";
import { itsCoreService } from "../services/itsCoreService";
import { assignDepartmentRole } from "./assignDepartmentRole";

/**
 * ユーザー認証処理の結果
 */
export interface AuthenticationResult {
  success: boolean;
  message: string;
  reason?: "MEMBER_NOT_FOUND" | "EMAIL_NOT_VERIFIED" | "TECHNICAL_ERROR";
}

/**
 * Discord上でのユーザー認証を実行するUsecase
 * メンバー情報の確認、メール認証チェック、ロール付与を行う
 */
export async function authenticateUser(
  discordUserId: string,
  guildId: string,
): Promise<AuthenticationResult> {
  try {
    // 1. ITSCoreからメンバー情報を取得
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

    // 2. EmailAuthServiceでメール認証状況を確認
    const isEmailVerified = await emailAuthService.isEmailVerified(member.mail);
    if (!isEmailVerified) {
      logger.warn(`Email not verified for user: ${member.mail}`);
      return {
        success: false,
        message:
          "メール認証が完了していません。もう一度認証メールを確認するか、認証プロセスをやり直してください。",
        reason: "EMAIL_NOT_VERIFIED",
      };
    }

    // 3. 認証成功 - ロールとニックネームを設定
    await Promise.all([
      // 部署ロールの付与
      assignDepartmentRole(guildId, discordUserId, member),
      // 承認済みロールの付与
      discordServerService.addRoleToMember(
        guildId,
        discordUserId,
        roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey),
      ),
      // 未承認ロールの削除
      discordServerService.removeRoleFromMember(
        guildId,
        discordUserId,
        roleRegistry.getRole(roleRegistryKeys.unAuthorizedRoleKey),
      ),
      // ニックネーム設定
      discordServerService.setMemberNickname(
        guildId,
        discordUserId,
        member.name,
      ),
    ]);

    logger.info(
      `User authenticated successfully: ${member.name} (${member.mail})`,
    );
    return {
      success: true,
      message: "認証が完了しました！ロールが付与されました。",
    };
  } catch (error) {
    logger.error(
      `Error during user authentication for Discord ID ${discordUserId}:`,
      error,
    );
    return {
      success: false,
      message: "認証処理中にエラーが発生しました。管理者に連絡してください。",
      reason: "TECHNICAL_ERROR",
    };
  }
}
