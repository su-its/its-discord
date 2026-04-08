import { randomUUID } from "node:crypto";
import type { AppDeps } from "@application/ports";
import { loadConfig } from "@config/environment";
import logger from "@infrastructure/logger";

export interface LinkAndVerifyResult {
  success: boolean;
  message: string;
  reason?:
    | "MEMBER_NOT_FOUND"
    | "ALREADY_LINKED"
    | "MEMBER_LINKED_TO_OTHER"
    | "ALREADY_VERIFIED"
    | "TECHNICAL_ERROR";
}

/**
 * メールアドレスで core の会員を検索し、認証メールを送信してから
 * Discord アカウントを紐付ける。
 */
export async function linkAndSendVerification(
  discordUserId: string,
  email: string,
  deps: Pick<AppDeps, "itsCorePort" | "emailAuthPort">,
): Promise<LinkAndVerifyResult> {
  try {
    const member = await deps.itsCorePort.getMemberByEmail(email);
    if (!member) {
      return {
        success: false,
        message:
          "このメールアドレスに対応するメンバーが見つかりません。管理者に登録を依頼してください。",
        reason: "MEMBER_NOT_FOUND",
      };
    }

    const existingLink =
      await deps.itsCorePort.getMemberByDiscordId(discordUserId);
    if (existingLink) {
      return {
        success: false,
        message:
          "このDiscordアカウントは既に紐付け済みです。`/auth` を再実行してください。",
        reason: "ALREADY_LINKED",
      };
    }

    if (member.discord) {
      return {
        success: false,
        message:
          "このメンバーは既に別のDiscordアカウントに紐付けられています。管理者に連絡してください。",
        reason: "MEMBER_LINKED_TO_OTHER",
      };
    }

    const existingUser = await deps.emailAuthPort.getUserByEmail(email);
    if (existingUser?.emailVerified) {
      await deps.itsCorePort.connectDiscordAccount({
        memberId: member.id,
        discordAccountId: discordUserId,
      });
      return {
        success: true,
        message:
          "メール認証は既に完了しています。`/auth` を再実行してロールを受け取ってください。",
        reason: "ALREADY_VERIFIED",
      };
    }

    const config = loadConfig();
    const verificationOptions = {
      url: config.authRedirectUrl,
      handleCodeInApp: true,
    };

    if (existingUser) {
      await deps.emailAuthPort.sendEmailVerification(
        existingUser,
        verificationOptions,
      );
    } else {
      const user = await deps.emailAuthPort.createUserWithEmailAndPassword({
        email,
        password: randomUUID(),
      });
      await deps.emailAuthPort.sendEmailVerification(user, verificationOptions);
    }

    await deps.itsCorePort.connectDiscordAccount({
      memberId: member.id,
      discordAccountId: discordUserId,
    });

    logger.info(
      `Verification email sent to ${email} for Discord user ${discordUserId}`,
    );
    return {
      success: true,
      message:
        "認証メールを送信しました。メールのリンクを踏んでから、もう一度 `/auth` を実行してください。",
    };
  } catch (error) {
    logger.error(
      `Failed to link and send verification for ${discordUserId}:`,
      error,
    );
    return {
      success: false,
      message: "処理中にエラーが発生しました。管理者に連絡してください。",
      reason: "TECHNICAL_ERROR",
    };
  }
}
