import type Member from "../../domain/entities/member";
import type AuthData from "../../domain/types/authData";
import { toInternalMember } from "../../infrastructure/itscore/mapper";
import { memberUsecase } from "../../infrastructure/itscore/usecases";

async function authMember(authData: AuthData): Promise<boolean> {
  const result = await memberUsecase.getMemberList.execute({});
  const members: Member[] = result.members.map((member) => toInternalMember(member));
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
