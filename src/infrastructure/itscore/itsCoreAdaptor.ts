import { createMemberService } from "@shizuoka-its/core";
import type {
  ITSCorePort,
  MemberConnectionData,
  MemberNicknameUpdateData,
  MemberRegistrationData,
} from "../../application/ports/itsCorePort";
import type InternalMember from "../../domain/entities/member";
import { departmentToAffiliation, toInternalMember } from "./mapper";

/**
 * ITSCoreのメンバー機能へのアクセスを提供するAdapter（ヘキサゴナルアーキテクチャ）
 * v3のMemberService facadeを使用
 */
export class ITSCoreAdaptor implements ITSCorePort {
  private service = createMemberService();

  async registerMember(data: MemberRegistrationData): Promise<void> {
    const affiliation = departmentToAffiliation(data.department);
    await this.service.register({
      name: data.name,
      studentId: data.studentId,
      email: data.email,
      affiliation,
    });
  }

  async getMemberByDiscordId(
    discordId: string,
  ): Promise<InternalMember | undefined> {
    const result = await this.service.getByDiscordId(discordId);
    return result.member
      ? toInternalMember(result.member, { discordId })
      : undefined;
  }

  async getMemberByEmail(email: string): Promise<InternalMember | undefined> {
    const result = await this.service.getByEmail(email);
    return result.member ? toInternalMember(result.member) : undefined;
  }

  async connectDiscordAccount(data: MemberConnectionData): Promise<void> {
    await this.service.connectDiscordAccount({
      memberId: data.memberId,
      discordAccountId: data.discordAccountId,
      discordNickName: data.discordNickName,
    });
  }

  async getMemberList(): Promise<InternalMember[]> {
    const result = await this.service.list();
    return result.members.map((member) => toInternalMember(member));
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
