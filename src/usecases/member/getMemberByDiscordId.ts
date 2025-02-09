import type { IMemberRepository } from "../../infra/repository/IMemberRepository";
import type Member from "../../entities/member";

/**
 * Discord IDから該当メンバーを取得するユースケース
 */
export default async function getMemberByDiscordId(
  memberRepository: IMemberRepository,
  discordId: string,
): Promise<Member | null> {
  return await memberRepository.getByDiscordId(discordId);
}
