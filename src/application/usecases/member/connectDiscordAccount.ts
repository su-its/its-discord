import type Member from "../../../domain/entities/member";
import type {
  ConnectDiscordAccountInput,
  IMemberRepository,
} from "../../repository/IMemberRepository";

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
