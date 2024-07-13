import Member from "../entities/member";
import AuthData from "../types/authData";
import getAllMembers from "../usecases/getMembers";

async function authMember(authData: AuthData): Promise<boolean> {
  const members: Member[] = await getAllMembers();
  //membersの中からauthDataと一致するものがあるかどうかを確認する
  const authMember: Member | undefined = members.find((member) => {
    return (
      member.student_number === authData.student_number &&
      member.mail === authData.mail &&
      member.department === authData.department &&
      member.name === authData.name
    );
  });

  return authMember ? true : false;
}

export default authMember;
