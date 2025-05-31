import type AuthData from "../../domain/types/authData";
import logger from "../../infrastructure/logger";
import { itsCoreService } from "../services/itsCoreService";

/**
 * ユーザーが提供した認証情報がITSCoreのメンバー情報と一致するかを検証するUsecase
 */
export async function verifyMemberCredentials(
  authData: AuthData,
): Promise<boolean> {
  try {
    // すべての必要な情報が揃っているかチェック
    if (
      !authData.name ||
      !authData.student_number ||
      !authData.department ||
      !authData.mail
    ) {
      logger.warn("Incomplete auth data provided", authData);
      return false;
    }

    // ITSCoreから全メンバーリストを取得
    const members = await itsCoreService.getMemberList();

    // 提供された情報と一致するメンバーを検索
    const matchingMember = members.find((member) => {
      return (
        member.student_number === authData.student_number &&
        member.mail === authData.mail &&
        member.department === authData.department &&
        member.name === authData.name
      );
    });

    if (matchingMember) {
      logger.info(
        `Member credentials verified for: ${authData.name} (${authData.student_number})`,
      );
      return true;
    }

    logger.warn(
      `Member credentials verification failed for: ${authData.name} (${authData.student_number})`,
    );
    return false;
  } catch (error) {
    logger.error("Error verifying member credentials:", error);
    return false;
  }
}
