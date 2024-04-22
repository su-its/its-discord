import AuthData from "../types/authData";
import sendAuthMail from "../usecases/sendAuthMail";
import { getMemberByEamil } from "./MemberController";
import setDiscordId from "../usecases/setDiscordId";
import Member from "../entities/member";

async function sendAuthMailController(userInfo: AuthData) {
  try {
    if (!checkAuthData(userInfo)) {
      throw new Error("Invalid AuthData");
    }
    await sendAuthMail(userInfo.mail!, userInfo.student_number!, userInfo.department!);

    const member = await getMemberByEamil(userInfo.mail!);
    checkMember(member);

    await setDiscordId(member!.id!, userInfo.discordId!);
  } catch (e) {
    console.error(e);
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
    throw new Error("Member not found");
  } else if (!member.id) {
    throw new Error("Member id is not provided");
  }
}

export default sendAuthMailController;
