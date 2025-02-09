import type { IMemberRepository } from "../../infra/repository/IMemberRepository";
import type Member from "../../entities/member";

/**
 * メールアドレスから該当メンバーを取得するユースケース
 */
export default async function getMemberByEmail(
  memberRepository: IMemberRepository,
  email: string,
): Promise<Member | null> {
  return await memberRepository.getByEmail(email);
}
