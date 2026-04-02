import {
  type CompleteAffiliation,
  createMemberService,
} from "@shizuoka-its/core";
import type {
  ITSCorePort,
  MemberConnectionData,
  MemberNicknameUpdateData,
  MemberRegistrationData,
} from "../../application/ports/itsCorePort";
import type Member from "../../domain/entities/member";
import { memberWithDiscordToInternal, toMember } from "./mapper";

/**
 * ITSCoreのメンバー機能へのアクセスを提供するAdapter（ヘキサゴナルアーキテクチャ）
 * v3のMemberService facadeを使用
 */
export class ITSCoreAdaptor implements ITSCorePort<CompleteAffiliation> {
  private service = createMemberService();

  async registerMember(
    data: MemberRegistrationData<CompleteAffiliation>,
  ): Promise<void> {
    await this.service.register({
      name: data.name,
      studentId: data.studentId,
      email: data.email,
      affiliation: data.affiliation,
    });
  }

  async getMemberByDiscordId(discordId: string): Promise<Member | undefined> {
    const result = await this.service.getByDiscordId(discordId);
    return result.member ? toMember(result.member, { discordId }) : undefined;
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const result = await this.service.getByEmail(email);
    if (!result.member) return undefined;

    // discord 紐付け情報を含めて返す
    const withDiscord = await this.service.getMemberWithDiscordAccounts(
      result.member.id,
    );
    return withDiscord.member
      ? memberWithDiscordToInternal(withDiscord.member)
      : toMember(result.member);
  }

  async connectDiscordAccount(data: MemberConnectionData): Promise<void> {
    await this.service.connectDiscordAccount({
      memberId: data.memberId,
      discordAccountId: data.discordAccountId,
    });
  }

  async getMemberList(): Promise<Member[]> {
    const result = await this.service.listMembersWithDiscordAccounts();
    return result.entries.map(memberWithDiscordToInternal);
  }

  async updateMemberNickname(data: MemberNicknameUpdateData): Promise<void> {
    await this.service.changeDiscordNickName({
      discordAccountId: data.discordAccountId,
      discordNickName: data.discordNickName,
    });
  }
}

// シングルトンとしてエクスポート
export const itsCoreMemberRepository = new ITSCoreAdaptor();
