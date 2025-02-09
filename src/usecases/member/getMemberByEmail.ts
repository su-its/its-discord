import type Member from "../../entities/member";
import type { IMemberRepository } from "../../infrastructure/repository/IMemberRepository";

/**
 * メールアドレスから該当メンバーを取得するユースケース
 */
export default async function getMemberByEmail(
  memberRepository: IMemberRepository,
  email: string,
): Promise<Member | null> {
  return await memberRepository.getByEmail(email);
}
