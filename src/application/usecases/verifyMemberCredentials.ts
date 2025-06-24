import type { MemberCredentials } from "../../domain/types/memberCredentials";
import logger from "../../infrastructure/logger";
import { itsCoreService } from "../services/itsCoreService";

/**
 * ユーザーが提供した認証情報がITSCoreのメンバー情報と一致するかを検証するUsecase
 */
export async function verifyMemberCredentials(
  credentials: MemberCredentials,
): Promise<boolean> {
  try {

    // ITSCoreから全メンバーリストを取得
    const members = await itsCoreService.getMemberList();

    // 提供された情報と一致するメンバーを検索
    const matchingMember = members.find((member) => {
      return (
        member.student_number === credentials.student_number &&
        member.mail === credentials.mail &&
        member.department === credentials.department &&
        member.name === credentials.name
      );
    });

    if (matchingMember) {
      logger.info(
        `Member credentials verified for: ${credentials.name} (${credentials.student_number})`,
      );
      return true;
    }

    logger.warn(
      `Member credentials verification failed for: ${credentials.name} (${credentials.student_number})`,
    );
    return false;
  } catch (error) {
    logger.error("Error verifying member credentials:", error);
    return false;
  }
}
