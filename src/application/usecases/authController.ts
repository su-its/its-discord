import { loadConfig } from "../../config/environment";
import type AuthData from "../../domain/types/authData";
import { itsCoreService } from "../services/itsCoreService";
import sendAuthMail from "./sendAuthMail";

/**
 * メンバーの登録を行う
 * @param {AuthData} userInfo メンバーの登録に必要なデータ
 */

// TODO: 次PRで DM auth flow を廃止し /auth に統合する。
// この型とファイル全体が不要になる。
interface MemberRegistrationInfo {
  mail: string;
  student_number: string;
  department: string;
  discordId: string;
}

async function handleMemberRegistration(userInfo: AuthData) {
  const memberRegistrationInfo =
    convertAuthDataToMemberRegistrationInfo(userInfo);
  const config = loadConfig();
  await sendAuthMail(
    memberRegistrationInfo.mail,
    memberRegistrationInfo.student_number,
    memberRegistrationInfo.department,
    config.authRedirectUrl,
  );

  const member = await itsCoreService.getMemberByEmail(
    memberRegistrationInfo.mail,
  );
  if (!member) {
    throw new Error("Member not found");
  }

  await itsCoreService.connectDiscordAccount({
    memberId: member.id,
    discordAccountId: memberRegistrationInfo.discordId,
  });
}

function convertAuthDataToMemberRegistrationInfo(
  userInfo: AuthData,
): MemberRegistrationInfo {
  if (
    !userInfo.mail ||
    !userInfo.student_number ||
    !userInfo.department ||
    !userInfo.discordId
  ) {
    throw new Error(
      `Missing required fields in AuthData: ${JSON.stringify(userInfo)}`,
    );
  }
  return {
    mail: userInfo.mail,
    student_number: userInfo.student_number,
    department: userInfo.department,
    discordId: userInfo.discordId,
  };
}

export default handleMemberRegistration;
