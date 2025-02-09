import type Member from "../../entities/member";
import type {
  IMemberRepository,
  MemberCreateInput,
} from "../../infrastructure/repository/IMemberRepository";

/**
 * 新規メンバーを作成するユースケース
 */
export default async function insertMember(
  memberRepository: IMemberRepository,
  input: MemberCreateInput,
): Promise<Member> {
  return await memberRepository.insert(input);
}
