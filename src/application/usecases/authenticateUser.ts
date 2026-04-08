import type { AppDeps } from "@application/ports";
import roleRegistry, { roleRegistryKeys } from "@domain/types/roles";
import logger from "@infrastructure/logger";
import { assignMemberRole } from "./assignDepartmentRole";

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
  deps: Pick<AppDeps, "itsCorePort" | "emailAuthPort" | "discordMemberPort">,
): Promise<AuthenticationResult> {
  try {
    // 1. ITSCoreからメンバー情報を取得
    const member = await deps.itsCorePort.getMemberByDiscordId(discordUserId);
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
    const isEmailVerified = await deps.emailAuthPort.isEmailVerified(
      member.universityEmail,
    );
    if (!isEmailVerified) {
      logger.warn(`Email not verified for user: ${member.universityEmail}`);
      return {
        success: false,
        message:
          "メール認証が完了していません。もう一度認証メールを確認するか、認証プロセスをやり直してください。",
        reason: "EMAIL_NOT_VERIFIED",
      };
    }

    // 3. 認証成功 - ロールとニックネームを設定
    await Promise.all([
      // ステータス・所属ロールの付与
      assignMemberRole(guildId, discordUserId, member, deps),
      // 認証済みロールの付与
      deps.discordMemberPort.addRoleToMember(
        guildId,
        discordUserId,
        roleRegistry.getRole(roleRegistryKeys.authorizedRoleKey),
      ),
      // メール未認証ロールの削除
      deps.discordMemberPort.removeRoleFromMember(
        guildId,
        discordUserId,
        roleRegistry.getRole(roleRegistryKeys.unauthorizedRoleKey),
      ),
      // ニックネーム設定（サーバーオーナー等、権限不足で失敗しても認証自体は続行する）
      deps.discordMemberPort
        .setMemberNickname(guildId, discordUserId, member.name)
        .catch((error) => {
          logger.warn(
            `Failed to set nickname for ${discordUserId}: ${error.message}`,
          );
        }),
    ]);

    logger.info(
      `User authenticated successfully: ${member.name} (${member.universityEmail})`,
    );
    return {
      success: true,
      message: `認証が完了しました！ようこそ、<@${discordUserId}>さん。`,
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
