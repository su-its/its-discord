import type {
  IMemberRepository,
  MemberCreateInput,
} from "../../infra/repository/IMemberRepository";
import type Member from "../../entities/member";

/**
 * 新規メンバーを作成するユースケース
 */
export default async function insertMember(
  memberRepository: IMemberRepository,
  input: MemberCreateInput,
): Promise<Member> {
  return await memberRepository.insert(input);
}
