import type Member from "../entities/member";
import prismaClient from "../infra/prisma";
import MemberRepository from "../infra/repository/memberRepository";
import type AuthData from "../types/authData";
import setDiscordId from "../usecases/member/connectDiscordAccount";
import connectDiscordAccount from "../usecases/member/connectDiscordAccount";
import getMemberByEmail from "../usecases/member/getMemberByEmail";
import sendAuthMail from "../usecases/sendAuthMail";

const memberRepository = new MemberRepository(prismaClient);

async function sendAuthMailController(userInfo: AuthData) {
  try {
    if (!checkAuthData(userInfo)) {
      console.error("Invalid AuthData");
      throw new Error("Invalid AuthData");
    }

    const { mail, student_number, department, discordId } = userInfo;

    if (!mail || !student_number || !department || !discordId) {
      console.error("Missing required fields in AuthData");
      throw new Error("Missing required fields in AuthData");
    }

    await sendAuthMail(mail, student_number, department);

    const member = await getMemberByEmail(memberRepository, mail);

    if (!member) {
      console.error("Member not found");
      throw new Error("Member not found");
    }

    checkMember(member);

    if (!member.id) {
      console.error("Member ID is missing");
      throw new Error("Member ID is missing");
    }

    await connectDiscordAccount(memberRepository, member.id, discordId);
  } catch (e) {
    console.error(e);
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

function checkMember(member: Member | undefined): void {
  if (!member) {
    console.error("Member not found");
    throw new Error("Member not found");
  }
  if (!member.id) {
    console.error("Member id is not provided");
    throw new Error("Member id is not provided");
  }
}

export default sendAuthMailController;
