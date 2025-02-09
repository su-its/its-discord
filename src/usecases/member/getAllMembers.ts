import type { IMemberRepository } from "../../infra/repository/IMemberRepository";
import type Member from "../../entities/member";

/**
 * 全メンバーを取得するユースケース
 */
export default async function getAllMembers(
  memberRepository: IMemberRepository,
): Promise<Member[]> {
  return await memberRepository.getAll();
}
