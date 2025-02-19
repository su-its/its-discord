import type Member from "../../domain/entities/member";
import type AuthData from "../../domain/types/authData";
import { getAllMembersController } from "../controllers/MemberController";

async function authMember(authData: AuthData): Promise<boolean> {
  const members: Member[] = await getAllMembersController();
  //membersの中からauthDataと一致するものがあるかどうかを確認する
  const authMember: Member | undefined = members.find((member) => {
    return (
      member.student_number === authData.student_number &&
      member.mail === authData.mail &&
      member.department === authData.department &&
      member.name === authData.name
    );
  });

  return !!authMember;
}

export default authMember;
