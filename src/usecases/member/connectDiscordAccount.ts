import type {
  IMemberRepository,
  ConnectDiscordAccountInput,
} from "../../infra/repository/IMemberRepository";
import type Member from "../../entities/member";

/**
 * メンバーに Discord アカウントを紐付けるユースケース
 */
export default async function connectDiscordAccount(
  memberRepository: IMemberRepository,
  memberId: string,
  discordId: string,
): Promise<Member> {
  return await memberRepository.connectDiscordAccount({
    memberId,
    discordAccount: {
      id: discordId,
      nickName: "",
    },
  });
}
