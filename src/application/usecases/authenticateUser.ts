import type { UserRecord } from "firebase-admin/lib/auth/user-record";
import roleRegistry, { roleRegistryKeys } from "../../domain/types/roles";
import { firebaseAuthService } from "../../infrastructure/firebase";
import logger from "../../infrastructure/logger";
import { discordServerService } from "../services/discordServerService";
import { itsCoreService } from "../services/itsCoreService";

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

    // 2. Firebaseでメール認証状況を確認
    const user: UserRecord = await firebaseAuthService.getUserByEmail(
      member.mail,
    );
    if (!user.emailVerified) {
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
      discordServerService.addDepartmentRoleToMember(
        guildId,
        discordUserId,
        member,
      ),
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
      `User authentication successful: ${discordUserId} (${member.name})`,
    );
    return {
      success: true,
      message: "認証に成功しました! ITSへようこそ!",
    };
  } catch (error) {
    logger.error(`Authentication error for user ${discordUserId}:`, error);
    return {
      success: false,
      message: "認証に失敗しました",
      reason: "TECHNICAL_ERROR",
    };
  }
}
