import type Member from "../../domain/entities/member";
import type AuthData from "../../domain/types/authData";
import logger from "../../infrastructure/logger";
import prismaClient from "../../infrastructure/prisma";
import MemberRepository from "../repository/memberRepository";
import connectDiscordAccount from "../usecases/member/connectDiscordAccount";
import getMemberByEmail from "../usecases/member/getMemberByEmail";
import sendAuthMail from "../usecases/sendAuthMail";

const memberRepository = new MemberRepository(prismaClient);

// TODO: メールの送信だけでなく、DiscordAccountとの紐づけも行ってしまっている https://github.com/su-its/its-discord/issues/72
async function sendAuthMailController(userInfo: AuthData) {
  try {
    if (!checkAuthData(userInfo)) {
      logger.error("Invalid AuthData");
      throw new Error("Invalid AuthData");
    }

    const { mail, student_number, department, discordId } = userInfo;

    if (!mail || !student_number || !department || !discordId) {
      logger.error("Missing required fields in AuthData");
      throw new Error("Missing required fields in AuthData");
    }

    await sendAuthMail(mail, student_number, department);

    const member = await getMemberByEmail(memberRepository, mail);

    const validatedMember = validateMemberExists(member);

    await connectDiscordAccount(
      memberRepository,
      validatedMember.id,
      discordId,
    );
  } catch (e) {
    logger.error("Failed to send auth mail:", e);
    throw e;
  }
}

function checkAuthData(userInfo: AuthData): boolean {
  return (
    userInfo.mail !== undefined &&
    userInfo.student_number !== undefined &&
    userInfo.department !== undefined &&
    userInfo.discordId !== undefined
  );
}

function validateMemberExists(member: Member | undefined | null): Member {
  if (!member) {
    logger.error("Member not found");
    throw new Error("Member not found");
  }
  if (!member.id) {
    logger.error("Member id is not provided");
    throw new Error("Member id is not provided");
  }
  return member;
}

export default sendAuthMailController;
