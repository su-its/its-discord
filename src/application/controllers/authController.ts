import type Member from "../../domain/entities/member";
import type AuthData from "../../domain/types/authData";
import prismaClient from "../../infrastructure/prisma";
import MemberRepository from "../repository/memberRepository";
import connectDiscordAccount from "../usecases/member/connectDiscordAccount";
import getMemberByEmail from "../usecases/member/getMemberByEmail";
import sendAuthMail from "../usecases/sendAuthMail";

const memberRepository = new MemberRepository(prismaClient);

/**
 * メンバーの登録を行う
 * @param {AuthData} userInfo メンバーの登録に必要なデータ
 */

// TODO: この型は何をするのかinlineドキュメント https://github.com/su-its/its-discord/issues/25
// NOTE: AuthDataの設計意図がうまく組めなかったので、AuthDataに必須なデータ型をここだけで独自定義
// NOTE: #25次第でこの型は不要になるかも
interface MemberRegistrationInfo extends Omit<Member, "id" | "name"> {
  discordId: string;
}

async function handleMemberRegistration(userInfo: AuthData) {
  const memberRegistrationInfo =
    convertAuthDataToMemberRegistrationInfo(userInfo);
  await sendAuthMail(
    memberRegistrationInfo.mail,
    memberRegistrationInfo.student_number,
    memberRegistrationInfo.department,
  );

  const member = await getMemberByEmail(
    memberRepository,
    memberRegistrationInfo.mail,
  );
  if (!member) {
    throw new Error("Member not found");
  }

  await connectDiscordAccount(
    memberRepository,
    member.id,
    memberRegistrationInfo.discordId,
  );
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
