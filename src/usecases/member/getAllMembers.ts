import type Member from "../../entities/member";
import type { IMemberRepository } from "../../infra/repository/IMemberRepository";

/**
 * 全メンバーを取得するユースケース
 */
export default async function getAllMembers(
  memberRepository: IMemberRepository,
): Promise<Member[]> {
  return await memberRepository.getAll();
}
