import type { MemberCredentials } from "../../domain/types/memberCredentials";
import { itsCoreService } from "../services/itsCoreService";
import sendAuthMail from "./sendAuthMail";

/**
 * メンバーの登録を行う
 * @param {MemberCredentials} userInfo メンバーの登録に必要なデータ
 */
async function handleMemberRegistration(userInfo: MemberCredentials) {
  await sendAuthMail(
    userInfo.mail,
    userInfo.student_number,
    userInfo.department,
  );

  const member = await itsCoreService.getMemberByEmail(
    userInfo.mail,
  );
  if (!member) {
    throw new Error("Member not found");
  }

  await itsCoreService.connectDiscordAccount({
    memberId: member.id,
    discordAccountId: userInfo.discordId,
  });
}

export default handleMemberRegistration;
