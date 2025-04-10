import type Member from "../../../domain/entities/member";
import type {
  IMemberRepository,
  MemberUpdateInput,
} from "../../repository/IMemberRepository";

/**
 * メンバーの情報を更新するユースケース
 */
export default async function updateMember(
  memberRepository: IMemberRepository,
  input: MemberUpdateInput,
): Promise<Member> {
  return await memberRepository.update(input);
}
