import type Member from "../../../domain/entities/member";
import type { IMemberRepository } from "../../repository/IMemberRepository";

/**
 * Discord IDから該当メンバーを取得するユースケース
 */
export default async function getMemberByDiscordId(
  memberRepository: IMemberRepository,
  discordId: string,
): Promise<Member | null> {
  return await memberRepository.getByDiscordId(discordId);
}
